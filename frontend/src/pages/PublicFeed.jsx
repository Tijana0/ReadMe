"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/public-feed.css"
import NavMenu from "../components/NavMenu"

const PublicFeed = () => {
    const navigate = useNavigate()
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [categories, setCategories] = useState([])

    useEffect(() => {
        fetchLiteraryNews()
        fetchCategories()
    }, [selectedCategory])

    const fetchLiteraryNews = async () => {
        try {
            setLoading(true)

            // Use mock data directly instead of API call
            const mockNews = [
                {
                    id: 1,
                    title: "Booker Prize 2024 Winner Announced",
                    content:
                        "The prestigious Booker Prize has been awarded to an extraordinary work of contemporary fiction that explores themes of identity and belonging in the modern world. The winning novel, praised for its lyrical prose and compelling narrative, beat out five other finalists in what judges called 'an exceptionally strong year for literary fiction.'",
                    excerpt:
                        "The prestigious Booker Prize has been awarded to an extraordinary work of contemporary fiction that explores themes of identity and belonging in the modern world.",
                    author: "Literary News Team",
                    category: "Awards",
                    published_at: "2024-01-15T10:00:00Z",
                    tags: ["Booker Prize", "Awards", "Fiction"],
                    external_url: "https://thebookerprizes.com/the-booker-library/features/full-list-of-booker-prize-winners-shortlisted-and-longlisted-authors",
                },
                {

                    id: 2,
                    title: "New Margaret Atwood Novel Coming This Fall",
                    content:
                        "The acclaimed author of 'The Handmaid's Tale' announces her latest dystopian masterpiece, set to release in September 2024. The new novel promises to continue Atwood's exploration of feminist themes and societal critique through speculative fiction.",
                    excerpt:
                        "The acclaimed author of 'The Handmaid's Tale' announces her latest dystopian masterpiece, set to release in September 2024.",
                    author: "Book Publishing Weekly",
                    category: "New Releases",
                    published_at: "2024-01-14T14:30:00Z",
                    tags: ["Margaret Atwood", "New Release", "Dystopian Fiction"],
                    external_url: "https://www.publishersweekly.com/",
                },
                {
                    id: 3,
                    title: "Independent Bookstores See Record Growth",
                    content:
                        "Despite digital trends, independent bookstores across the country report a 15% increase in sales, driven by community engagement and curated selections. Local bookstore owners credit their success to hosting author events, book clubs, and creating spaces for literary community.",
                    excerpt:
                        "Despite digital trends, independent bookstores across the country report a 15% increase in sales, driven by community engagement and curated selections.",
                    author: "Indie Book Report",
                    category: "Industry News",
                    published_at: "2024-01-13T09:15:00Z",
                    tags: ["Independent Bookstores", "Industry", "Community"],
                    external_url: "https://www.bookweb.org/",
                },
                {
                    id: 4,
                    title: "Book Club Trends: What Readers Are Choosing",
                    content:
                        "A comprehensive look at the most popular book club selections of 2024, featuring diverse voices and thought-provoking narratives. From literary fiction to memoirs, book clubs are embracing stories that spark meaningful discussions about contemporary issues.",
                    excerpt:
                        "A comprehensive look at the most popular book club selections of 2024, featuring diverse voices and thought-provoking narratives.",
                    author: "Reading Communities Today",
                    category: "Trends",
                    published_at: "2024-01-12T16:45:00Z",
                    tags: ["Book Clubs", "Reading Trends", "Community Reading"],
                    external_url: "https://www.goodreads.com/news",
                },
                {
                    id: 5,
                    title: "Literary Festival Season Kicks Off",
                    content:
                        "Spring literary festivals around the world prepare to welcome renowned authors, emerging writers, and book enthusiasts for a celebration of literature. This year's lineup includes Pulitzer Prize winners, debut novelists, and poets from around the globe.",
                    excerpt:
                        "Spring literary festivals around the world prepare to welcome renowned authors, emerging writers, and book enthusiasts for a celebration of literature.",
                    author: "Festival Guide",
                    category: "Events",
                    published_at: "2024-01-11T11:20:00Z",
                    tags: ["Literary Festivals", "Events", "Authors"],
                    external_url: "https://www.poetrysociety.org.uk/",
                },
                {
                    id: 6,
                    title: "Colson Whitehead's New Novel Breaks Pre-Order Records",
                    content:
                        "The two-time Pulitzer Prize winner's upcoming novel has already broken pre-order records at major retailers. Publishers are calling it his most ambitious work yet, spanning multiple generations and exploring themes of family, legacy, and the American experience.",
                    excerpt:
                        "The two-time Pulitzer Prize winner's upcoming novel has already broken pre-order records at major retailers.",
                    author: "Publishing Today",
                    category: "Author News",
                    published_at: "2024-01-10T13:30:00Z",
                    tags: ["Colson Whitehead", "Pre-orders", "Literary Fiction"],
                    external_url: "https://www.nytimes.com/section/books",
                },
                {
                    id: 7,
                    title: "The Rise of Climate Fiction: A New Literary Movement",
                    content:
                        "Climate fiction, or 'cli-fi,' is emerging as a powerful literary genre that addresses environmental concerns through compelling storytelling. Authors are using fiction to explore the human impact of climate change, creating narratives that both entertain and educate readers about our planet's future.",
                    excerpt:
                        "Climate fiction, or 'cli-fi,' is emerging as a powerful literary genre that addresses environmental concerns through compelling storytelling.",
                    author: "Environmental Literature Review",
                    category: "Trends",
                    published_at: "2024-01-09T10:15:00Z",
                    tags: ["Climate Fiction", "Environmental Literature", "Genre Fiction"],
                    external_url: "https://www.theguardian.com/books",
                },
                {
                    id: 8,
                    title: "National Book Award Longlist Reveals Diverse Voices",
                    content:
                        "This year's National Book Award longlist showcases an unprecedented diversity of voices, with works spanning multiple genres and perspectives. The selection committee emphasized their commitment to recognizing literature that reflects the full spectrum of American experience.",
                    excerpt:
                        "This year's National Book Award longlist showcases an unprecedented diversity of voices, with works spanning multiple genres and perspectives.",
                    author: "Awards Watch",
                    category: "Awards",
                    published_at: "2024-01-08T15:45:00Z",
                    tags: ["National Book Award", "Diversity", "American Literature"],
                    external_url: "https://www.nationalbook.org/",
                },
                {
                    id: 9,
                    title: "Poetry Renaissance: Young Poets Take Center Stage",
                    content:
                        "A new generation of poets is revitalizing the literary landscape with fresh voices and innovative approaches to verse. Social media platforms have become unexpected venues for poetry, with young poets building massive followings and bringing poetry to new audiences.",
                    excerpt:
                        "A new generation of poets is revitalizing the literary landscape with fresh voices and innovative approaches to verse.",
                    author: "Poetry Today",
                    category: "Trends",
                    published_at: "2024-01-07T12:20:00Z",
                    tags: ["Poetry", "Young Poets", "Social Media"],
                    external_url: "https://www.poets.org/",
                },
                {
                    id: 10,
                    title: "Bestselling Author Announces Retirement from Writing",
                    content:
                        "After a career spanning four decades and over 30 novels, beloved mystery writer announces retirement from writing. Fans around the world are celebrating the author's contributions to the genre while mourning the end of an era in crime fiction.",
                    excerpt:
                        "After a career spanning four decades and over 30 novels, beloved mystery writer announces retirement from writing.",
                    author: "Mystery Writers Digest",
                    category: "Author News",
                    published_at: "2024-01-06T14:10:00Z",
                    tags: ["Mystery Fiction", "Retirement", "Crime Writers"],
                    external_url: "https://www.mysterywriters.org/",
                },
            ]

            // Filter by category if selected
            let filteredPosts = mockNews
            if (selectedCategory) {
                filteredPosts = mockNews.filter((post) => post.category === selectedCategory)
            }

            setPosts(filteredPosts)
        } catch (error) {
            console.error("Failed to fetch literary news:", error)
            setPosts([])
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            // Use mock categories directly
            const mockCategories = ["Awards", "New Releases", "Industry News", "Trends", "Events", "Author News"]
            setCategories(mockCategories)
        } catch (error) {
            console.error("Failed to fetch categories:", error)
            // Fallback categories
            setCategories(["Awards", "New Releases", "Industry News", "Trends", "Events"])
        }
    }

    const handleCategoryFilter = (category) => {
        if (selectedCategory === category) {
            setSelectedCategory(null) // Clear filter if same category clicked
        } else {
            setSelectedCategory(category)
        }
    }

    const handlePostClick = (post) => {
        if (post.external_url) {
            window.open(post.external_url, "_blank", "noopener,noreferrer")
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const getCategoryColor = (category) => {
        const colors = {
            Awards: "#d79a1b",
            "New Releases": "#617b72",
            "Industry News": "#8b5a3c",
            Trends: "#6b5b95",
            Events: "#88a0a8",
            "Author News": "#a67c52",
            "Book Reviews": "#7a6b8d",
        }
        return colors[category] || "#666"
    }

    if (loading) {
        return (
            <div className="public-feed-container">
                <NavMenu />
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                    <p>Loading literary news...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="public-feed-container">
            <NavMenu />

            <div className="public-feed-content">
                {/* Left Column - Main Feed */}
                <div className="public-feed-main">
                    <h1 className="public-feed-title">
                        Literary News & Updates
                        {selectedCategory && <span style={{ fontSize: "1.5rem", color: "#617b72" }}> - {selectedCategory}</span>}
                    </h1>

                    <div className="literary-news-feed">
                        {posts.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                                <p>No news articles found{selectedCategory ? ` for category "${selectedCategory}"` : ""}.</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <article
                                    key={post.id}
                                    className="news-article news-article-clickable"
                                    onClick={() => handlePostClick(post)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="news-article-header">
                                        <div className="news-category" style={{ backgroundColor: getCategoryColor(post.category) }}>
                                            {post.category}
                                        </div>
                                        <div className="news-meta">
                                            <span className="news-author">By {post.author}</span>
                                            <span className="news-date">{formatDate(post.published_at)}</span>
                                        </div>
                                    </div>

                                    <div className="news-content">
                                        <div className="news-text">
                                            <h2 className="news-title">{post.title}</h2>
                                            <p className="news-excerpt">{post.excerpt || post.content}</p>
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="news-tags">
                                                    {post.tags.map((tag, index) => (
                                                        <span key={index} className="news-tag">
                              #{tag}
                            </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Click indicator */}
                                    <div className="news-click-indicator">
                                        <span>Click to read more →</span>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="public-feed-sidebar">
                    <div className="sidebar-section">
                        <h3 style={{ color: "#FEFFEE", marginBottom: "1rem" }}>Categories</h3>
                        <div className="category-filters">
                            <button
                                className="category-filter-btn"
                                style={{
                                    backgroundColor: selectedCategory === null ? "#FEFFEE" : "rgba(255, 255, 255, 0.2)",
                                    color: selectedCategory === null ? "#617b72" : "#FEFFEE",
                                    border: "none",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "1rem",
                                    margin: "0.25rem",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                }}
                                onClick={() => setSelectedCategory(null)}
                            >
                                All
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className="category-filter-btn"
                                    style={{
                                        backgroundColor: selectedCategory === category ? "#FEFFEE" : getCategoryColor(category),
                                        color: selectedCategory === category ? "#617b72" : "#FEFFEE",
                                        border: "none",
                                        padding: "0.5rem 1rem",
                                        borderRadius: "1rem",
                                        margin: "0.25rem",
                                        cursor: "pointer",
                                        fontSize: "0.9rem",
                                    }}
                                    onClick={() => handleCategoryFilter(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3 style={{ color: "#FEFFEE", marginBottom: "1rem" }}>Featured</h3>
                        <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.9rem" }}>
                            Stay updated with the latest in the literary world. From award announcements to new releases, we bring you
                            the most important news in books and reading. Click on any article to read the full story from our trusted
                            sources.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="public-feed-footer">Copyright 2025 - All rights reserved</footer>
        </div>
    )
}

export default PublicFeed