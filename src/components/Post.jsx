import React from "react";
import IconElement from "./IconElement.jsx";
import { timeAgo } from "../services/forum";
import "./Post.css";
import Button from "./Button.jsx";

/**
 * Post component
 * Props:
 * - post: { id, title, body, like_count, published_at, user_id }
 * - variant: 'preview' | 'full' (default: 'preview')
 * - showDivider: boolean (preview only)
 * - onClick: () => void
 * - onLike: () => void
 * - onComment: () => void
 * - onShare: () => void
 * - onAuthorClick: (user_id) => void
 */
export default function Post({
  post,
  variant = "preview",
  showDivider = false,
  onClick,
  onLike,
  onComment,
  onShare,
  onAuthorClick,
}) {
  if (!post) return null;
  const { id, title, body, like_count, published_at, user_id } = post;

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    if (onAuthorClick && user_id) {
      onAuthorClick(user_id);
    }
  };

  const displayName = post?.profiles?.username ?? "Anonymous";

  return (
    <article className="post-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="post-card__body">
        <div className="post-card__head">
          <strong
            className="post-card__author"
            onClick={handleAuthorClick}
            style={{ cursor: onAuthorClick && user_id ? "pointer" : "default" }}
          >
            @{displayName}
          </strong>
          <span className="post-card__time">{timeAgo(published_at)}</span>
        </div>
        <div className="post-card__content">
          {title ? <div className="post-card__title">{title}</div> : null}
          <p
            className={
              "post-card__text " +
              (variant === "preview" ? "post-card__text--clamp" : "")
            }
          >
            {body}
          </p>
        </div>

        <div
          className="post-card__actions"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            icon="Favorite"
            text={`${like_count}`}
            variant="outline"
            size="sm"
            onClick={onLike}
            iconFilled={false}
          />
          <Button
            icon="Chat_bubble"
            text={`${like_count}`}
            variant="outline"
            size="sm"
            onClick={onComment}
            iconFilled={false}
          />
          <Button
            icon="Share"
            text={post.title || displayName}
            variant="outline"
            size="sm"
            onClick={onShare}
            iconFilled={false}
          />
        </div>
      </div>
      {variant === "preview" && showDivider && (
        <div className="post-card__divider" />
      )}
    </article>
  );
}
