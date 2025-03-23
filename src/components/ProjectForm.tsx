import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { uploadCoverArt } from '../lib/services/coverArt'

export function ProjectForm() {
  const navigate = useNavigate()
  const { createProject } = useProjects()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null)
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const title = formData.get('title') as string
      const genre = formData.get('genre') as string
      const description = formData.get('description') as string
      const bpm = parseInt(formData.get('bpm') as string)
      const key = formData.get('key') as string
      const mood = formData.get('mood') as string
      const tags = (formData.get('tags') as string)
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
      const coverArt = formData.get('coverArt') as File

      // Handle cover art upload
      let coverArtUrl = ''
      if (coverArt && coverArt.size > 0) {
        const result = await uploadCoverArt(coverArt)
        coverArtUrl = result.url
      }

      await createProject({
        title,
        genre,
        description,
        bpm,
        key,
        mood,
        tags,
        coverArt: coverArtUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      navigate('/')
    } catch (err) {
      console.error('Error creating project:', err)
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCoverArtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverArtFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverArtPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
          Genre
        </label>
        <select
          id="genre"
          name="genre"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select a genre</option>
          <option value="Hip Hop">Hip Hop</option>
          <option value="Trap">Trap</option>
          <option value="R&B">R&B</option>
          <option value="Pop">Pop</option>
          <option value="Electronic">Electronic</option>
          <option value="House">House</option>
          <option value="Techno">Techno</option>
          <option value="Drill">Drill</option>
          <option value="Soul">Soul</option>
          <option value="Jazz">Jazz</option>
          <option value="Lo-Fi">Lo-Fi</option>
          <option value="Reggaeton">Reggaeton</option>
          <option value="Afrobeat">Afrobeat</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="bpm" className="block text-sm font-medium text-gray-700">
            BPM
          </label>
          <input
            type="number"
            id="bpm"
            name="bpm"
            min="20"
            max="200"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="key" className="block text-sm font-medium text-gray-700">
            Key
          </label>
          <select
            id="key"
            name="key"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select a key</option>
            <option value="C">C</option>
            <option value="C#">C#</option>
            <option value="D">D</option>
            <option value="D#">D#</option>
            <option value="E">E</option>
            <option value="F">F</option>
            <option value="F#">F#</option>
            <option value="G">G</option>
            <option value="G#">G#</option>
            <option value="A">A</option>
            <option value="A#">A#</option>
            <option value="B">B</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="mood" className="block text-sm font-medium text-gray-700">
          Mood
        </label>
        <select
          id="mood"
          name="mood"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select a mood</option>
          <option value="Happy">Happy</option>
          <option value="Sad">Sad</option>
          <option value="Energetic">Energetic</option>
          <option value="Chill">Chill</option>
          <option value="Dark">Dark</option>
          <option value="Romantic">Romantic</option>
          <option value="Aggressive">Aggressive</option>
          <option value="Melancholic">Melancholic</option>
        </select>
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          placeholder="e.g., summer, party, workout"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="coverArt" className="block text-sm font-medium text-gray-700">
          Cover Art
        </label>
        <input
          type="file"
          id="coverArt"
          name="coverArt"
          accept="image/*"
          onChange={handleCoverArtChange}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100"
        />
        {coverArtPreview && (
          <div className="mt-2">
            <img
              src={coverArtPreview}
              alt="Cover art preview"
              className="h-32 w-32 object-cover rounded-lg"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  )
}
