import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import IconElement from "../components/IconElement.jsx";
import "./BranchPost.css";

export default function BranchPost() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState([]);

  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0, 4);
    const mapped = arr.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setImages((s) => [...s, ...mapped].slice(0, 4));
  };

  const onChooseFiles = (e) => handleFiles(e.target.files || []);
  const handleGif = () => {
    // TODO: open GIF picker
    console.log("open GIF picker");
  };

  const handlePost = () => {
    // TODO: send to API/store
    navigate("/forum");
  };

  return (
    <div className="branch-page">
      <header className="branch-top" role="banner">
        <div className="branch-top-left">
          <Button text="Cancel" variant="ghost" size="sm" onClick={() => navigate(-1)} />
        </div>

        <div className="branch-top-right">
          <Button text="Post" variant="solid" size="sm" onClick={handlePost} disabled={!body.trim()} />
        </div>
      </header>

      <main className="branch-main" role="main">
        <section className="branch-meta-row">
          <div className="branch-avatar" aria-hidden>
            <IconElement icon="account_circle" size={36} filled={false} />
          </div>

          <div className="branch-meta-body">
            <div className="branch-author">Leon Pena</div>
            <input
              className="branch-title"
              placeholder="What you thinking?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label="Headline (optional)"
            />
          </div>
        </section>

        <section className="branch-composer">
          <textarea
            className="branch-body"
            placeholder="Write your post — add context, photos, and any questions to start the branch."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            aria-label="Write your post"
          />

          <div className="media-row">
            <div className="media-left">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onChooseFiles}
                style={{ display: "none" }}
              />
              <Button
                icon="photo_camera"
                text=""
                variant="outline"
                size="sm"
                onClick={() => fileRef.current && fileRef.current.click()}
                aria-label="Add photo"
              />
              <Button
                icon="gif"
                text=""
                variant="outline"
                size="sm"
                onClick={handleGif}
                aria-label="Add GIF"
              />
            </div>

            <div className="media-previews">
              {images.map((img, i) => (
                <div
                  className="media-thumb"
                  key={i}
                  style={{ backgroundImage: `url(${img.url})` }}
                  title={img.name}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}