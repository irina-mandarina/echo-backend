export type Show = {
    available_markets: string[]
    copyrights: {
        text: string
        type: string
    }[]
    description: string
    html_description: string
    explicit: boolean
    external_urls: {
        href: string
    }
    id: string
    images: {
        url: string
        width: number
        height: number
    }[]
    is_externally_hosted: boolean
    languages: string[]
    media_type: string
    name: string
    publisher: string
    type: string
    uri: string
    total_episodes: number
}

export type ShowSearchResult = {
    name: string
    publisher: string
    images: {
        url: string
    }[]
    uri: string
    id: string
    description: string
}