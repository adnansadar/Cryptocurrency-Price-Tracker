"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addWatchlistItem,
  createWatchlist,
  deleteSavedScreen,
  deleteWatchlist,
  getResearchNotes,
  getSavedScreens,
  getWatchlists,
} from "@/lib/api";
import { AuthGateDialog } from "./auth-gate-dialog";
import { useAuth } from "./auth-provider";

export function WorkspaceTerminal() {
  const { user, isPending } = useAuth();
  const queryClient = useQueryClient();
  const [gateOpen, setGateOpen] = useState(false);
  const [coinId, setCoinId] = useState("");
  const enabled = Boolean(user);
  const lists = useQuery({
    queryKey: ["workspace", "watchlists", user?.id],
    queryFn: getWatchlists,
    enabled,
  });
  const screens = useQuery({
    queryKey: ["workspace", "screens", user?.id],
    queryFn: getSavedScreens,
    enabled,
  });
  const notes = useQuery({
    queryKey: ["workspace", "notes", user?.id],
    queryFn: getResearchNotes,
    enabled,
  });

  const refresh = (area: string) =>
    queryClient.invalidateQueries({
      queryKey: ["workspace", area, user?.id],
    });
  const createList = useMutation({
    mutationFn: createWatchlist,
    onSuccess: () => void refresh("watchlists"),
  });
  const removeList = useMutation({
    mutationFn: deleteWatchlist,
    onSuccess: () => void refresh("watchlists"),
  });
  const addItem = useMutation({
    mutationFn: ({ listId, coin }: { listId: string; coin: string }) =>
      addWatchlistItem(listId, coin),
    onSuccess: () => void refresh("watchlists"),
  });
  const removeScreen = useMutation({
    mutationFn: deleteSavedScreen,
    onSuccess: () => void refresh("screens"),
  });

  if (isPending)
    return (
      <div className="terminal-panel state-card compact">
        Checking account access…
      </div>
    );

  if (!user)
    return (
      <>
        <section className="terminal-panel workspace-lock">
          <span className="lock-mark" aria-hidden="true">
            🔒
          </span>
          <p className="eyebrow">Account-only workspace</p>
          <h2>Build a private research library.</h2>
          <p>
            Create an account to save watchlists, reusable market screens, and
            research notes securely across devices.
          </p>
          <button className="primary-button" onClick={() => setGateOpen(true)}>
            Unlock workspace
          </button>
          <div className="locked-feature-grid" aria-hidden="true">
            <span>Watchlists</span>
            <span>Saved screens</span>
            <span>Research notes</span>
          </div>
        </section>
        <AuthGateDialog
          open={gateOpen}
          onClose={() => setGateOpen(false)}
          feature="the research workspace"
        />
      </>
    );

  if (lists.isLoading || screens.isLoading || notes.isLoading)
    return (
      <div className="terminal-panel state-card compact">
        Loading your workspace…
      </div>
    );

  if (lists.isError || screens.isError || notes.isError)
    return (
      <div className="terminal-panel state-card">
        <span>!</span>
        <h2>Your workspace could not be loaded</h2>
        <p>Please check your connection and try again.</p>
        <button
          className="primary-button"
          onClick={() =>
            void queryClient.invalidateQueries({ queryKey: ["workspace"] })
          }
        >
          Try again
        </button>
      </div>
    );

  const watchlists = lists.data ?? [];
  const savedScreens = screens.data ?? [];
  const researchNotes = notes.data ?? [];
  const quickAddList = watchlists.find((list) => list.name !== "My watchlist");

  function newList() {
    const name = window.prompt("Watchlist name")?.trim();
    if (name) createList.mutate(name);
  }

  return (
    <div className="workspace-grid">
      <section className="terminal-panel workspace-section watchlists">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Collections</p>
            <h2>Watchlists</h2>
          </div>
          <button
            className="secondary-button"
            onClick={newList}
            disabled={createList.isPending}
          >
            New list
          </button>
        </div>
        <div className="watchlist-grid">
          {watchlists.length ? (
            watchlists.map((list) => (
              <article key={list.id}>
                <div>
                  <h3>{list.name}</h3>
                  <span>{list.items.length} assets</span>
                </div>
                <div className="token-list">
                  {list.items.length ? (
                    list.items.map((item) => (
                      <Link href={`/coin/${item.coinId}`} key={item.id}>
                        {item.coinId}
                      </Link>
                    ))
                  ) : (
                    <p>No assets yet.</p>
                  )}
                </div>
                {list.name !== "My watchlist" && (
                  <button
                    className="danger-link"
                    disabled={removeList.isPending}
                    onClick={() => removeList.mutate(list.id)}
                  >
                    Delete list
                  </button>
                )}
              </article>
            ))
          ) : (
            <div className="empty-inline">
              <p>Add an asset from Markets to create your primary watchlist.</p>
            </div>
          )}
        </div>
        {quickAddList && (
          <form
            className="quick-add"
            onSubmit={(event) => {
              event.preventDefault();
              const coin = coinId.trim().toLowerCase();
              if (coin) {
                addItem.mutate({ listId: quickAddList.id, coin });
                setCoinId("");
              }
            }}
          >
            <label>
              Quick-add a CoinGecko ID to {quickAddList.name}
              <input
                value={coinId}
                onChange={(event) => setCoinId(event.target.value)}
                placeholder="e.g. chainlink"
              />
            </label>
            <button className="primary-button" disabled={addItem.isPending}>
              Add
            </button>
          </form>
        )}
      </section>

      <section className="terminal-panel workspace-section">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Reusable research</p>
            <h2>Saved screens</h2>
          </div>
          <span>{savedScreens.length} saved</span>
        </div>
        {savedScreens.length ? (
          <div className="saved-list">
            {savedScreens.map((screen) => (
              <article key={screen.id}>
                <div>
                  <strong>{screen.name}</strong>
                  <small>
                    {new Date(screen.updatedAt).toLocaleDateString()}
                  </small>
                </div>
                <div>
                  <Link
                    className="secondary-button"
                    href={`/?${new URLSearchParams(screen.query)}`}
                  >
                    Open
                  </Link>
                  <button
                    className="danger-link"
                    disabled={removeScreen.isPending}
                    onClick={() => removeScreen.mutate(screen.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-inline">
            <p>No saved screens yet.</p>
            <Link href="/">Build a market screen →</Link>
          </div>
        )}
      </section>

      <section className="terminal-panel workspace-section">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Research log</p>
            <h2>Notes</h2>
          </div>
          <span>{researchNotes.length} assets</span>
        </div>
        {researchNotes.length ? (
          <div className="notes-list">
            {researchNotes.map((note) => (
              <Link href={`/coin/${note.coinId}`} key={note.coinId}>
                <strong>{note.coinId}</strong>
                <p>{note.body}</p>
                <small>
                  Updated {new Date(note.updatedAt).toLocaleDateString()}
                </small>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-inline">
            <p>Your coin notes will appear here.</p>
          </div>
        )}
      </section>
    </div>
  );
}
