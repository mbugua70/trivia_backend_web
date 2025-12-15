"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Dashboard() {
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlayerCount();
  }, []);

  const fetchPlayerCount = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://trivia-backend-one.onrender.com/api/players/all");
      const data = await response.json();

      if (data.success) {
        setTotalPlayers(data.count);
      } else {
        setError("Failed to fetch player count");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <h1 className={styles.title}>Trivia Dashboard</h1>
        <Link href="/players" className={styles.navLink}>
          View Players
        </Link>
      </nav>

      <main className={styles.main}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Total Players</h2>
          {loading ? (
            <p className={styles.loading}>Loading...</p>
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : (
            <p className={styles.count}>{totalPlayers}</p>
          )}
        </div>
      </main>
    </div>
  );
}
