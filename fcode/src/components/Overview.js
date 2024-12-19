import React, { useEffect, useState } from 'react';

const Overview = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch the summary from the backend API when the component mounts
    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/get-summary/');
                if (!response.ok) {
                    throw new Error('Failed to fetch summary');
                }
                const data = await response.json();
                setSummary(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    // Debugging: log summary to inspect its structure
    console.log("Summary:", summary);

    return (
        <>
            {summary && (
                <div className="summary-table container mt-3">
                    {/* General summary information */}
                    <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>Summary</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Total Papers</td>
                                <td>{summary.total_papers}</td>
                            </tr>
                            <tr>
                                <td>Year Range</td>
                                <td>{summary.year_range}</td>
                            </tr>
                            <tr>
                                <td>Unique Authors</td>
                                <td>{summary.num_unique_authors}</td>
                            </tr>
                            <tr>
                                <td>Unique Publishers</td>
                                <td>{summary.num_unique_publishers}</td>
                            </tr>
                            <tr>
                                <td>Unique Affiliations</td>
                                <td>{summary.num_unique_affilation}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Document types */}
                    {summary.document_type_counts && (
                        <>
                            <h3>Document Types</h3>
                            <table className="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Document Type</th>
                                        <th>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(summary.document_type_counts).map(([docType, count]) => (
                                        <tr key={docType}>
                                            <td>{docType}</td>
                                            <td>{count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* Languages */}
                    {summary.languages && (
                        <>
                            <h3>Languages</h3>
                            <table className="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>Language</th>
                                        <th>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(summary.languages).map(([language, count]) => (
                                        <tr key={language}>
                                            <td>{language}</td>
                                            <td>{count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}
        </>
    );
};

export default Overview;
