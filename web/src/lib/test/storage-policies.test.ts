import { authService } from '../services/auth'
import { supabase } from '../supabase'

describe('Storage Policies', () => {
  // Test file upload as guest
  test('should allow guest to upload files', async () => {
    // Sign in as guest
    const { user } = await authService.signInAsGuest()

    // Create a test file
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })

    // Upload file
    const { data: upload, error: uploadError } = await supabase.storage
      .from('user_files')
      .upload(`${user?.id}/test.txt`, testFile)

    // Verify upload
    expect(uploadError).toBeNull()
    expect(upload).toBeDefined()
    expect(upload.path).toContain(user?.id)

    // Try to access file
    const { data: download } = await supabase.storage
      .from('user_files')
      .download(`${user?.id}/test.txt`)

    expect(download).toBeDefined()

    // Clean up
    await supabase.storage.from('user_files').remove([`${user?.id}/test.txt`])
    await supabase.auth.signOut()
  })

  // Test file access restrictions
  test('should prevent accessing other users files', async () => {
    // Sign in as first guest
    const { user: user1 } = await authService.signInAsGuest()

    // Upload a file as first user
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    await supabase.storage.from('user_files').upload(`${user1?.id}/test.txt`, testFile)

    // Sign in as second guest
    await supabase.auth.signOut()
    const { user: user2 } = await authService.signInAsGuest()

    // Try to access first user's file
    const { data: download, error: accessError } = await supabase.storage
      .from('user_files')
      .download(`${user1?.id}/test.txt`)

    // Verify access is denied
    expect(accessError).toBeDefined()
    expect(download).toBeNull()

    // Clean up
    await supabase.auth.signOut()
    await supabase.auth.signIn({ email: user1?.email, password: 'test' })
    await supabase.storage.from('user_files').remove([`${user1?.id}/test.txt`])
    await supabase.auth.signOut()
  })

  // Test guest file cleanup
  test('should cleanup expired guest files', async () => {
    // Sign in as guest
    const { user } = await authService.signInAsGuest()

    // Upload a file
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    await supabase.storage.from('user_files').upload(`${user?.id}/test.txt`, testFile)

    // Manually expire the guest account
    await supabase.auth.updateUser({
      data: {
        guestExpiresAt: new Date(Date.now() - 1000).toISOString(),
      },
    })

    // Call cleanup
    await authService.cleanupGuestData()

    // Try to access the file
    const { data: download, error: accessError } = await supabase.storage
      .from('user_files')
      .download(`${user?.id}/test.txt`)

    // Verify file is deleted
    expect(accessError).toBeDefined()
    expect(download).toBeNull()
  })
})
