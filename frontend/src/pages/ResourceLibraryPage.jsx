import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FilterSidebar from '@/components/features/library/FilterSidebar';
import ResourceCard from '@/components/features/library/ResourceCard';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api';

// --- Mock fallback data: 30 resources ---
const mockResources = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    title: `Autism Resource ${i + 1}`,
    description: `Helpful article, guide, or video related to autism (${i + 1}).`,
    type: i % 2 === 0 ? "Article" : "Video",
    link: "https://example.com/resource",
}));

export default function ResourceLibraryPage() {
    const [resources, setResources] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 5 });
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        challenge: '',
        age: '',
        page: 1,
    });

    useEffect(() => {
        const fetchLibraryItems = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: filters.page,
                    limit: 6,
                });
                if (filters.search) params.append('search', filters.search);
                if (filters.challenge) params.append('challenge', filters.challenge);
                if (filters.age) params.append('age', filters.age);

                const response = await apiClient.get(`/resources/library?${params.toString()}`);

                // ✅ Normalize response with safe defaults
                const fetchedResources = Array.isArray(response.data?.data)
                    ? response.data.data
                    : [];

                const fetchedPagination = response.data?.pagination || {
                    currentPage: filters.page,
                    totalPages: Math.ceil(mockResources.length / 6),
                };

                setResources(fetchedResources.length ? fetchedResources : mockResources);
                setPagination(fetchedPagination);
            } catch (error) {
                console.error("Failed to fetch library items:", error);
                // ✅ Fallback to mock data
                setResources(mockResources);
                setPagination({
                    currentPage: filters.page,
                    totalPages: Math.ceil(mockResources.length / 6),
                });
            } finally {
                setLoading(false);
            }
        };
        fetchLibraryItems();
    }, [filters]);

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold font-heading">Resource Library</h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                    Find curated articles, guides, and videos to support you on your journey.
                </p>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <FilterSidebar filters={filters} setFilters={setFilters} />
                </div>
                <main className="lg:col-span-3">
                    {loading ? (
                        <div className="text-center py-16">Loading resources...</div>
                    ) : resources.length > 0 ? (
                        <>
                            <div className="grid md:grid-cols-2 gap-6">
                                {resources.map(resource => (
                                    <motion.div
                                        key={resource.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <ResourceCard resource={resource} />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            <div className="mt-8 flex justify-center items-center gap-4">
                                <Button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm font-medium">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </span>
                                <Button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-xl font-semibold">No resources found</p>
                            <p className="text-muted-foreground mt-2">
                                Try adjusting your filters to find what you're looking for.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
