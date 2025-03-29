import { supabase } from '@/lib/supabase'

console.log('Loading Genius API service...')

const GENIUS_API_TOKEN = import.meta.env.VITE_GENIUS_API_TOKEN
const GENIUS_API_URL = 'https://api.genius.com'

// Validate API token on module load
console.log('Initializing Genius API service with environment:', {
  VITE_GENIUS_API_TOKEN: GENIUS_API_TOKEN ? 'Present' : 'Missing',
  GENIUS_API_URL
})

if (!GENIUS_API_TOKEN) {
  console.error('Genius API token is not configured. Please add VITE_GENIUS_API_TOKEN to your .env file.')
} else {
  console.log('Genius API token configured:', GENIUS_API_TOKEN.substring(0, 10) + '...')
}

interface GeniusSearchResponse {
  meta: {
    status: number
  }
  response: {
    hits: Array<{
      result: {
        id: number
        title: string
        artist_names: string
        url: string
        primary_artist: {
          name: string
        }
      }
    }>
  }
}

interface GeniusSongResponse {
  response: {
    song: {
      description: {
        plain: string
      }
      lyrics: {
        plain: string
      }
    }
  }
}

interface Quote {
  text: string
  author: string
  source?: string
}

// Cache quotes in Supabase for 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

async function getCachedQuote(): Promise<Quote | null> {
  try {
    const { data, error } = await supabase
      .from('cached_quotes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error

    if (!data) return null

    // Check if cache is expired
    const cacheAge = Date.now() - new Date(data.created_at).getTime()
    if (cacheAge > CACHE_DURATION) return null

    return {
      text: data.quote_text,
      author: data.artist_name,
      source: data.song_title
    }
  } catch (error) {
    console.error('Error fetching cached quote:', error)
    return null
  }
}

async function cacheQuote(quote: Quote): Promise<void> {
  try {
    const { error } = await supabase
      .from('cached_quotes')
      .insert({
        quote_text: quote.text,
        artist_name: quote.author,
        song_title: quote.source,
        created_at: new Date().toISOString()
      })

    if (error) throw error
  } catch (error) {
    console.error('Error caching quote:', error)
  }
}

async function searchGenius(query: string): Promise<GeniusSearchResponse> {
  try {
    const response = await fetch(`${GENIUS_API_URL}/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${GENIUS_API_TOKEN}`
      }
    })

    const responseText = await response.text()
    
    if (!response.ok) {
      throw new Error(`Genius API error (${response.status}): ${responseText}`)
    }

    try {
      const data = JSON.parse(responseText)
      return data
    } catch (e) {
      throw new Error('Failed to parse Genius API response: ' + responseText)
    }
  } catch (error) {
    console.error('Genius API search error:', error)
    throw error
  }
}

async function getSongDetails(songId: number): Promise<GeniusSongResponse> {
  console.log('Getting song details for ID:', songId)
  
  const response = await fetch(`${GENIUS_API_URL}/songs/${songId}`, {
    headers: {
      'Authorization': `Bearer ${GENIUS_API_TOKEN}`
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Genius API song details error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    })
    throw new Error(`Genius API error: ${response.statusText}`)
  }

  const data = await response.json()
  console.log('Genius API song details response:', data)
  return data
}

// Function to get lyrics from Genius URL using web scraping
async function getLyricsFromUrl(url: string): Promise<string> {
  console.log('Fetching lyrics from URL:', url)
  try {
    // Use a CORS proxy to avoid CORS issues
    const corsProxy = 'https://corsproxy.io/?'
    const response = await fetch(corsProxy + encodeURIComponent(url))
    
    if (!response.ok) {
      throw new Error(`Failed to fetch lyrics: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    console.log('Got HTML response, length:', html.length)
    
    // Extract lyrics from the HTML
    const lyricsMatch = html.match(/<div[^>]*class="[^"]*Lyrics__Container[^"]*"[^>]*>(.*?)<\/div>/gs)
    if (!lyricsMatch) {
      console.error('No lyrics found in HTML')
      throw new Error('No lyrics found on page')
    }

    // Clean up the lyrics
    const lyrics = lyricsMatch[0]
      .replace(/<[^>]*>/g, '\n') // Remove HTML tags
      .replace(/\n{2,}/g, '\n') // Remove extra newlines
      .trim()

    console.log('Extracted lyrics sample:', lyrics.substring(0, 100) + '...')
    return lyrics
  } catch (error) {
    console.error('Error fetching lyrics:', error)
    throw error
  }
}

function extractQuoteFromLyrics(lyrics: string): string {
  // Split lyrics into lines and filter out empty lines
  const lines = lyrics.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.includes('[') && !line.includes(']')) // Remove section headers
  
  // Find a suitable line (not too long, not too short)
  const suitableLines = lines.filter(line => {
    const length = line.length
    return length > 20 && length < 100 && 
           !line.toLowerCase().includes('chorus') && 
           !line.toLowerCase().includes('verse')
  })

  if (suitableLines.length === 0) {
    throw new Error('No suitable lyrics found')
  }

  // Return a random suitable line
  return suitableLines[Math.floor(Math.random() * suitableLines.length)]
}

export async function getRandomMusicQuote(): Promise<Quote> {
  try {
    // First try to get a cached quote
    console.log('Checking for cached quote...')
    const cachedQuote = await getCachedQuote()
    if (cachedQuote) {
      console.log('Using cached quote:', cachedQuote)
      return cachedQuote
    }
    console.log('No cached quote found, fetching from Genius API')

    // If no cached quote, fetch from Genius API
    if (!GENIUS_API_TOKEN) {
      throw new Error('Genius API token not configured')
    }

    // Search for songs with motivational lyrics
    const searchTerms = ['motivation', 'inspiration', 'create', 'dream', 'success']
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)]
    console.log('Using search term:', randomTerm)
    
    const searchResponse = await searchGenius(randomTerm)

    if (!searchResponse.response?.hits?.length) {
      throw new Error('No songs found in search results')
    }

    // Get a random song from the results
    const randomHit = searchResponse.response.hits[Math.floor(Math.random() * searchResponse.response.hits.length)]
    console.log('Selected song:', {
      title: randomHit.result.title,
      artist: randomHit.result.artist_names,
      url: randomHit.result.url
    })

    // Get lyrics from the song URL
    const lyrics = await getLyricsFromUrl(randomHit.result.url)
    
    // Extract a quote from the lyrics
    const quoteText = extractQuoteFromLyrics(lyrics)

    const quote: Quote = {
      text: quoteText,
      author: randomHit.result.primary_artist?.name || randomHit.result.artist_names,
      source: randomHit.result.title
    }

    console.log('Generated new quote:', quote)

    // Cache the quote
    await cacheQuote(quote)
    console.log('Quote cached successfully')

    return quote
  } catch (error) {
    console.error('Error in getRandomMusicQuote:', error)
    throw error
  }
} 