const users = [
    {
        slug: 'movieman22',
        username: 'MovieMan22',
        bio: 'Film lover sharing hot takes and hidden gems.',
        email: 'movieman22@example.com',
        password: 'Secret123!',
        date_joined: '2025-08-14T10:22:41.119Z',
    },
    {
        slug: 'cinephilejess',
        username: 'CinephileJess',
        bio: 'Always chasing the next great story on screen.',
        email: 'cinephilejess@example.com',
        password: 'WatchMoreMovies!',
        date_joined: '2025-09-02T16:58:10.447Z',
    },
    {
        slug: 'streamqueen',
        username: 'StreamQueen',
        bio: 'I review everything from comfort shows to chaos TV.',
        email: 'streamqueen@example.com',
        password: 'StreamItNow!',
        date_joined: '2025-09-28T19:45:27.733Z',
    },
    {
        slug: 'vinyljunkie',
        username: 'VinylJunkie',
        bio: 'Soundtrack collector and retro cinema enthusiast.',
        email: 'vinyljunkie@example.com',
        password: 'RetroBeats99!',
        date_joined: '2025-10-11T12:31:09.202Z',
    },
    {
        slug: 'retroreel',
        username: 'RetroReel',
        bio: 'Reviewing the past to appreciate cinema’s timeless magic.',
        email: 'retroreel@example.com',
        password: 'OldSchoolCine!',
        date_joined: '2025-11-01T08:55:33.584Z',
    },
]

export function getTestUser(req, res) {
    const { slug } = req.params
    const user = users.find((user) => user.slug === slug)
    if (user) {
        res.status(200).json(user)
    } else {
        res.status(404).json({ message: 'User not found' })
    }
}
