const movies = [
    {
        slug: 'rush-hour',
        title: 'Rush Hour',
        description:
            'A detective teams up with a reluctant partner to solve a high-stakes case.',
        date_added: '2025-11-05T22:13:38.967Z',
        img: 'rush-hour.jpg',
        genre: 'Action Comedy',
    },
    {
        slug: 'midnight-whispers',
        title: 'Midnight Whispers',
        description:
            'Strange events unfold in a small town after dark, blurring reality and nightmare.',
        date_added: '2025-10-28T19:05:14.321Z',
        img: 'midnight-whispers.jpg',
        genre: 'Eastern European Horror',
    },
    {
        slug: 'solar-flare',
        title: 'Solar Flare',
        description:
            'Astronauts struggle to survive after a catastrophic solar event threatens Earth.',
        date_added: '2025-09-14T11:22:49.104Z',
        img: 'solar-flare.jpg',
        genre: 'Sci-Fi Thriller',
    },
    {
        slug: 'hidden-truths',
        title: 'Hidden Truths',
        description:
            'A journalist uncovers a conspiracy that could shake the foundations of society.',
        date_added: '2025-08-30T08:44:55.672Z',
        img: 'hidden-truths.jpg',
        genre: 'Mystery Drama',
    },
    {
        slug: 'neon-dreams',
        title: 'Neon Dreams',
        description:
            'In a neon-lit city, a hacker fights against a corrupt megacorporation.',
        date_added: '2025-07-21T14:37:12.998Z',
        img: 'neon-dreams.jpg',
        genre: 'Cyberpunk Action',
    },
]

export function getTestMovies(req, res) {
    res.status(200).json(movies)
}

export function getTestMovie(req, res) {
    const { slug } = req.params
    const movie = movies.find((movie) => movie.slug === slug)
    if (movie) {
        res.status(200).json(movie)
    } else {
        res.status(404).json({ message: 'Movie not found' })
    }
}
