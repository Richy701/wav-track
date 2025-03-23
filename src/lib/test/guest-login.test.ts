import { authService } from '../services/auth'
import { supabase } from '../supabase'

describe('Guest Login Flow', () => {
  // Test guest account creation
  test('should create guest account', async () => {
    const { user, error } = await authService.signInAsGuest()

    // Verify account creation
    expect(error).toBeNull()
    expect(user).not.toBeNull()
    expect(user?.user_metadata.isGuest).toBe(true)
    expect(user?.user_metadata.guestExpiresAt).toBeDefined()

    // Clean up
    await supabase.auth.signOut()
  })

  // Test guest data access
  test('should have correct RLS permissions', async () => {
    // Sign in as guest
    const { user } = await authService.signInAsGuest()

    // Try to create a project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: 'Test Project',
        user_id: user?.id,
      })
      .select()
      .single()

    // Verify project creation
    expect(projectError).toBeNull()
    expect(project).toBeDefined()
    expect(project.user_id).toBe(user?.id)

    // Try to access another user's project (should fail)
    const { data: otherProject, error: accessError } = await supabase
      .from('projects')
      .select()
      .neq('user_id', user?.id)
      .single()

    expect(accessError).toBeDefined()
    expect(otherProject).toBeNull()

    // Clean up
    await supabase.auth.signOut()
  })

  // Test guest data cleanup
  test('should cleanup expired guest data', async () => {
    // Create guest account with expired timestamp
    const { user } = await authService.signInAsGuest()

    // Manually expire the guest account
    await supabase.auth.updateUser({
      data: {
        guestExpiresAt: new Date(Date.now() - 1000).toISOString(),
      },
    })

    // Call cleanup
    await authService.cleanupGuestData()

    // Verify cleanup
    const { data: projects } = await supabase.from('projects').select().eq('user_id', user?.id)

    expect(projects).toHaveLength(0)

    // Verify user is signed out
    const {
      data: { session },
    } = await supabase.auth.getSession()
    expect(session).toBeNull()
  })
})
