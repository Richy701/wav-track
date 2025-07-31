# Audio File Cleanup System

This document explains the audio file cleanup system implemented in WavTrack to manage storage usage and remove orphaned audio files.

## Overview

The audio cleanup system automatically removes audio files that are no longer needed, helping to:
- Reduce storage costs
- Free up space
- Maintain data integrity
- Improve application performance

## What Gets Cleaned Up

### 1. Orphaned Files
Audio files in storage that don't have corresponding active projects in the database.

### 2. Old Files
Audio files from projects that haven't been modified in over 1 year.

### 3. Deleted Project Files
Audio files from projects that have been soft-deleted.

## Implementation

### Database Functions

The cleanup system uses three PostgreSQL functions:

1. **`cleanup_orphaned_audio_files()`**
   - Removes audio files without active project references
   - Returns count of deleted files

2. **`cleanup_old_audio_files()`**
   - Removes audio files from inactive projects (1+ year old)
   - Returns count of deleted files

3. **`cleanup_deleted_project_audio()`**
   - Removes audio files from soft-deleted projects
   - Returns count of deleted files

### Storage Policies

The `project-audio` bucket has Row Level Security (RLS) policies that:
- Allow users to access only their own audio files
- Prevent cross-user file access
- Enable automatic cleanup of guest user files

### TypeScript Utilities

The `src/lib/utils/audioCleanup.ts` file provides:
- `performAudioCleanup()` - Comprehensive cleanup function
- `getAudioStorageStats()` - Get storage statistics
- Individual cleanup functions for specific scenarios

### React Component

The `AudioCleanupManager` component provides:
- Real-time storage statistics
- Manual cleanup triggers
- Visual feedback and progress tracking
- Error handling and reporting

## Usage

### Manual Cleanup (SQL)

Run the cleanup script in your Supabase SQL Editor:

```sql
-- Run the comprehensive cleanup
SELECT * FROM cleanup_orphaned_audio_files();
SELECT * FROM cleanup_old_audio_files();
SELECT * FROM cleanup_deleted_project_audio();
```

### Manual Cleanup (TypeScript)

```typescript
import { performAudioCleanup } from '@/lib/utils/audioCleanup'

// Perform comprehensive cleanup
const result = await performAudioCleanup()
console.log(`Deleted ${result.totalFilesDeleted} files`)
```

### UI Cleanup

Use the `AudioCleanupManager` component in your admin interface:

```tsx
import { AudioCleanupManager } from '@/components/admin/AudioCleanupManager'

function AdminPage() {
  return (
    <div>
      <AudioCleanupManager />
    </div>
  )
}
```

## Setup Instructions

1. **Run the storage policies migration:**
   ```sql
   -- Execute supabase/storage/policies.sql
   ```

2. **Create the cleanup functions:**
   ```sql
   -- Execute cleanup_orphaned_audio.sql
   ```

3. **Update your existing cleanup script:**
   ```sql
   -- The cleanup_old_data.sql has been updated to include audio cleanup
   ```

## Monitoring

### Storage Statistics

Monitor your audio storage usage:

```typescript
import { getAudioStorageStats } from '@/lib/utils/audioCleanup'

const stats = await getAudioStorageStats()
console.log({
  totalAudioFiles: stats.totalAudioFiles,
  projectsWithAudio: stats.projectsWithAudio,
  orphanedFiles: stats.orphanedFiles
})
```

### Cleanup Results

Each cleanup operation returns detailed results:

```typescript
interface AudioCleanupResult {
  orphanedFilesDeleted: number
  oldFilesDeleted: number
  deletedProjectFilesDeleted: number
  totalFilesDeleted: number
  errors: string[]
}
```

## Best Practices

1. **Regular Cleanup**: Run cleanup operations weekly or monthly
2. **Monitor Storage**: Keep track of storage usage and orphaned files
3. **Test First**: Always test cleanup functions on a development environment
4. **Backup**: Ensure you have backups before running cleanup operations
5. **Gradual Rollout**: Start with small cleanup batches to monitor impact

## Safety Features

- **Soft Deletes**: Projects are soft-deleted first, allowing recovery
- **Error Handling**: All cleanup operations include comprehensive error handling
- **Logging**: All cleanup operations are logged for audit purposes
- **User Isolation**: Users can only access their own audio files
- **Validation**: Cleanup functions validate file references before deletion

## Troubleshooting

### Common Issues

1. **Function Not Found**: Ensure cleanup functions are created in the database
2. **Permission Errors**: Check that RLS policies are properly configured
3. **Storage Access**: Verify bucket permissions and policies
4. **Large Cleanup**: For large datasets, run cleanup in smaller batches

### Debugging

Enable detailed logging:

```typescript
// Enable debug logging
console.log('Starting cleanup...')
const result = await performAudioCleanup()
console.log('Cleanup result:', result)
```

## Future Enhancements

Potential improvements to consider:
- Automated scheduled cleanup using cron jobs
- Configurable retention periods
- File size-based cleanup policies
- Compression for old audio files
- Backup and recovery procedures 