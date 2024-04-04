import { Show } from './Show'
export type Episode = {
    audio_preview_url: string | undefined // URL to a 30-second preview (MP3 format) of the episode. null if not available.
    duration_ms: number // The episode length in milliseconds.
    external_urls: { href: string } // Known external URLs for this episode.
    id: string // The Spotify ID for the episode.
    images: {
        url: string
        width: number
        height: number
    }[] // The cover art for the episode in various sizes, the widest first.
    name: string // The name of the episode.
    release_date: Date // The date the episode was first released, for example "1981-12-15". Depending on the precision, it might be shown as "1981" or "1981-12".
    resume_point: object | undefined // The user’s most recent position in the episode. Set if the supplied access token is a user token and has the scope user-read-playback-position.
    uri: string // The Spotify URI for the episode.
    show: Show // The show on which the episode belongs.
}