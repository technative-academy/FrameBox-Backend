const playlists = [
    {
        slug: 'scary-movies-to-sleep-to',
        title: 'Scary Movies To Sleep To',
        summary: 'A list of horror films oddly relaxing enough for bedtime.',
        date_created: '2025-08-12T22:18:43.219Z',
        author: 'MovieMan22',
    },
    {
        slug: 'underrated-horror-classics',
        title: 'Underrated Horror Classics',
        summary:
            'Hidden gems that deserve a spot in every horror fan’s collection.',
        date_created: '2025-09-03T17:42:11.509Z',
        author: 'CinephileJess',
    },
    {
        slug: 'comfort-shows-for-rainy-days',
        title: 'Comfort Shows For Rainy Days',
        summary: 'Feel-good series perfect for a cozy afternoon indoors.',
        date_created: '2025-09-28T09:14:55.871Z',
        author: 'StreamQueen',
    },
    {
        slug: 'best-movie-soundtracks-ever',
        title: 'Best Movie Soundtracks Ever',
        summary:
            'A celebration of the scores that made movie moments unforgettable.',
        date_created: '2025-10-17T19:33:22.334Z',
        author: 'VinylJunkie',
    },
    {
        slug: 'movies-that-aged-like-wine',
        title: 'Movies That Aged Like Wine',
        summary:
            'Films that have only gotten better with time and perspective.',
        date_created: '2025-11-03T11:47:06.142Z',
        author: 'RetroReel',
    },
]

export function getTestPlaylists(req, res) {
    res.status(200).json(playlists)
}

export function getTestPlaylist(req, res) {
    const { slug } = req.params
    const playlist = playlists.find((playlist) => playlist.slug === slug)
    if (playlist) {
        res.status(200).json(playlist)
    } else {
        res.status(404).json({ message: 'Playlist not found' })
    }
}
