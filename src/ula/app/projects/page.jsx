"use client";
import Link from "next/link";
import Image from "next/image";
import { useContent } from "@/context/ContentContext";
import "./projects.css";

export default function ProjectsListPage() {
    const { projects } = useContent();

    if (!projects || !projects.length) return <div>No projects found.</div>;

    return (
        <main className="projects-list">
            <h1>Our Projects</h1>
            <div className="projects-grid">
                {projects.map((p) => (
                    <Link key={p.id} href={`/projects/${p.id}`} className="project-card">
                        <article>
                            <div className="thumb">
                                <Image
                                    src={p.cover}
                                    alt={p.title}
                                    width={300}
                                    height={400}
                                    style={{
                                        objectFit: "cover",
                                        width: "100%",
                                        height: "auto",
                                        aspectRatio: "3 / 4",
                                    }}
                                />
                            </div>
                            <h2>{p.title}</h2>
                            <div className="project-tags">
                                {p.categories.map((cat) => (
                                    <span key={cat} className="project-tag">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        </main>
    );
}
