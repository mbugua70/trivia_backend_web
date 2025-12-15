"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import styles from "./players.module.css";

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://trivia-backend-one.onrender.com/api/players/all");
      const data = await response.json();

      if (data.success) {
        setPlayers(data.players);
      } else {
        setError("Failed to fetch players");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = useMemo(() => {
    let filtered = [...players];

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter((player) => {
        const playerDate = new Date(player.createdAt);
        return playerDate >= start;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((player) => {
        const playerDate = new Date(player.createdAt);
        return playerDate <= end;
      });
    }

    return filtered;
  }, [players, startDate, endDate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const exportToCSV = () => {
    if (filteredPlayers.length === 0) return;

    const headers = ["Name", "Score", "Created At"];
    const csvData = filteredPlayers.map((player) => [
      player.name,
      player.score || "N/A",
      formatDate(player.createdAt),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `players_${Date.now()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <h1 className={styles.title}>Players List</h1>
        <div className={styles.navActions}>
          <button onClick={exportToCSV} className={styles.exportBtn}>
            Export CSV
          </button>
          <Link href="/" className={styles.navLink}>
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className={styles.main}>
        {loading ? (
          <p className={styles.loading}>Loading players...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <>
            <div className={styles.filterSection}>
              <div className={styles.filterHeader}>
                <h3>Filter by Date</h3>
                {(startDate || endDate) && (
                  <button onClick={clearFilters} className={styles.clearBtn}>
                    Clear Filters
                  </button>
                )}
              </div>
              <div className={styles.filterInputs}>
                <div className={styles.inputGroup}>
                  <label htmlFor="startDate">Start Date:</label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={styles.dateInput}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="endDate">End Date:</label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={styles.dateInput}
                  />
                </div>
              </div>
            </div>

            <div className={styles.stats}>
              <p>
                Showing {filteredPlayers.length} of {players.length} players
                {(startDate || endDate) && " (filtered)"}
              </p>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Score</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.length === 0 ? (
                    <tr>
                      <td colSpan="3" className={styles.noData}>
                        No players found
                      </td>
                    </tr>
                  ) : (
                    filteredPlayers.map((player) => (
                      <tr key={player._id}>
                        <td>{player.name}</td>
                        <td>{player.score || "N/A"}</td>
                        <td>{formatDate(player.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
