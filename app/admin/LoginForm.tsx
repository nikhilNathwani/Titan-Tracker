"use client";

import { useState } from "react";
import { login } from "./actions";
import styles from "./admin.module.css";

export default function LoginForm() {
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setError(null);
		setPending(true);
		try {
			const result = await login(password);
			if (result.ok) {
				// Re-request /admin; it now renders the form for an authed session.
				window.location.reload();
				return;
			}
			setError(result.error);
			setPassword("");
		} catch {
			setError("Something went wrong. Try again.");
		} finally {
			setPending(false);
		}
	}

	return (
		<form className={styles.card} onSubmit={handleSubmit}>
			<h1 className={styles.heading}>Admin</h1>
			<p className={styles.subtle}>Enter the password to add episode data.</p>

			<label className={styles.field}>
				<span className={styles.label}>Password</span>
				<input
					type="password"
					name="password"
					autoComplete="current-password"
					autoFocus
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					className={styles.input}
					required
				/>
			</label>

			{error && <p className={styles.errorText}>{error}</p>}

			<button
				type="submit"
				className={styles.primaryButton}
				disabled={pending || password.length === 0}
			>
				{pending ? "Checking…" : "Unlock"}
			</button>
		</form>
	);
}
