export interface UpdateCheckResult {
    updateAvailable: boolean;
    latestVersion: string;
    downloadUrl: string;
    error?: string;
}

const GITHUB_REPO = 'viching16/MusicDuel';

import Constants from 'expo-constants';

export async function checkForUpdates(): Promise<void> {
    const currentVersion = Constants.expoConfig?.version || '1.0.0';
    try {
        const result = await checkGitHubRelease(currentVersion);
        if (result.updateAvailable) {
            console.log('Update available:', result.latestVersion);
            // Optionally show a toast or alert here if desired, 
            // but for now we just log it to avoid UI spam on every launch
        }
    } catch (e) {
        console.error('Failed to check for updates on launch', e);
    }
}

export async function checkGitHubRelease(currentVersion: string): Promise<UpdateCheckResult> {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);

        if (!response.ok) {
            throw new Error('Failed to fetch releases');
        }

        const data = await response.json();
        const latestTag = data.tag_name.replace(/^v/, ''); // Remove 'v' prefix if present
        const downloadUrl = data.html_url; // Link to the release page

        // Simple version comparison
        // Note: For more complex versioning (1.0.0 vs 1.0.10), use a dedicated semver library or split logic
        const hasUpdate = compareVersions(latestTag, currentVersion) > 0;

        return {
            updateAvailable: hasUpdate,
            latestVersion: latestTag,
            downloadUrl
        };
    } catch (error) {
        console.error('Update check failed:', error);
        return {
            updateAvailable: false,
            latestVersion: currentVersion,
            downloadUrl: '',
            error: 'Could not check for updates'
        };
    }
}

function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
    }
    return 0;
}
