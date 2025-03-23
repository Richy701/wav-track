// Create a singleton AudioContext
let audioContext: AudioContext | null = null
const audioElements = new Map<string, HTMLAudioElement>()

export const getAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.error('Failed to create AudioContext:', error)
      return null
    }
  }
  return audioContext
}

// Resume audio context if it was suspended
export const resumeAudioContext = async () => {
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch (error) {
      console.error('Failed to resume AudioContext:', error)
      throw new Error('Failed to resume audio playback')
    }
  }
}

// Clean up audio context and audio elements
export const cleanupAudioContext = () => {
  if (audioContext) {
    audioContext.close().catch(console.error)
    audioContext = null
  }
  audioElements.forEach(audio => {
    audio.pause()
    audio.src = ''
  })
  audioElements.clear()
}

// Fallback to HTML5 Audio
const loadAudioElement = async (url: string): Promise<HTMLAudioElement> => {
  if (audioElements.has(url)) {
    console.log(`Reusing cached HTMLAudioElement for ${url}`)
    return audioElements.get(url)!
  }

  console.log(`Creating new HTMLAudioElement for ${url}`)
  const audio = new Audio()

  // Add more detailed logging
  audio.addEventListener('loadstart', () => console.log(`Audio loading started for ${url}`), {
    once: true,
  })
  audio.addEventListener(
    'durationchange',
    () => console.log(`Audio duration available for ${url}: ${audio.duration}s`),
    { once: true }
  )
  audio.addEventListener('loadedmetadata', () => console.log(`Audio metadata loaded for ${url}`), {
    once: true,
  })

  return new Promise((resolve, reject) => {
    const onError = () => {
      const errorCode = audio.error ? audio.error.code : 'unknown'
      const errorMsg = audio.error ? audio.error.message : 'Unknown error'

      console.error(`HTML5 Audio error (${errorCode}) for ${url}: ${errorMsg}`)
      reject(new Error(`Failed to load audio file: ${errorMsg}`))
    }

    // Add timeout for loading
    const timeoutId = setTimeout(() => {
      audio.removeEventListener('error', onError)
      audio.removeEventListener('canplaythrough', onCanPlay)
      console.error(`Timeout loading audio from ${url}`)
      reject(new Error('Audio loading timeout'))
    }, 15000) // 15 seconds timeout

    const onCanPlay = () => {
      clearTimeout(timeoutId)
      console.log(`Audio can play through: ${url}`)
      audioElements.set(url, audio)
      resolve(audio)
    }

    audio.addEventListener('canplaythrough', onCanPlay, { once: true })
    audio.addEventListener('error', onError, { once: true })

    // Use crossOrigin to avoid CORS issues if needed
    // audio.crossOrigin = 'anonymous';

    audio.preload = 'auto'
    audio.src = url
    audio.load()
  })
}

// Load and decode audio file with fallback
export const loadAudioBuffer = async (url: string): Promise<AudioBuffer | HTMLAudioElement> => {
  // First try Web Audio API
  const ctx = getAudioContext()
  if (ctx) {
    try {
      console.log(`Attempting to load audio with Web Audio API from: ${url}`)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'audio/mpeg, audio/mp3, audio/*',
          'Cache-Control': 'no-cache',
        },
      })

      if (!response.ok) {
        const contentType = response.headers.get('Content-Type')
        const contentLength = response.headers.get('Content-Length')
        console.error(
          `HTTP error loading audio! status: ${response.status} (${response.statusText}), Content-Type: ${contentType}, Content-Length: ${contentLength}`
        )

        // Try to read error response
        const errorText = await response.text()
        console.error('Error response content:', errorText.substring(0, 200)) // First 200 chars only

        throw new Error(`HTTP error loading audio! status: ${response.status}`)
      }

      console.log('Audio file fetched, getting array buffer...')
      const arrayBuffer = await response.arrayBuffer()

      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        console.error('Received empty audio file from:', url)
        throw new Error('Received empty audio file')
      }

      console.log(`Decoding audio data from ${url} (${arrayBuffer.byteLength} bytes)...`)
      try {
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        console.log('Audio successfully decoded with Web Audio API:', {
          url,
          duration: audioBuffer.duration,
          numberOfChannels: audioBuffer.numberOfChannels,
          sampleRate: audioBuffer.sampleRate,
        })
        return audioBuffer
      } catch (decodeError) {
        console.warn(
          `Web Audio API decoding failed for ${url}, falling back to HTML5 Audio:`,
          decodeError
        )
        throw decodeError
      }
    } catch (error) {
      console.warn(`Web Audio API failed for ${url}, falling back to HTML5 Audio:`, error)
    }
  }

  // Fallback to HTML5 Audio API
  console.log(`Using HTML5 Audio API fallback for ${url}...`)
  return await loadAudioElement(url)
}

// Play audio with fallback support
export const playAudioBuffer = async (buffer: AudioBuffer | HTMLAudioElement) => {
  if (buffer instanceof AudioBuffer) {
    const ctx = getAudioContext()
    if (!ctx) {
      throw new Error('AudioContext not available')
    }

    try {
      await resumeAudioContext()

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)

      console.log('Starting audio playback with Web Audio API...')
      source.start(0)

      return new Promise<void>(resolve => {
        source.onended = () => {
          console.log('Audio playback completed')
          resolve()
        }
      })
    } catch (error) {
      console.error('Failed to play audio with Web Audio API:', error)
      throw error
    }
  } else {
    // HTML5 Audio fallback
    try {
      console.log('Starting audio playback with HTML5 Audio API...')
      buffer.currentTime = 0
      await buffer.play()

      return new Promise<void>(resolve => {
        buffer.onended = () => {
          console.log('Audio playback completed')
          resolve()
        }
      })
    } catch (error) {
      console.error('Failed to play audio with HTML5 Audio API:', error)
      throw error
    }
  }
}
