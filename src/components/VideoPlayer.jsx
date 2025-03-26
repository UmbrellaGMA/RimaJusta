
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function VideoPlayer({ videoUrl, setVideoUrl }) {
  const [inputUrl, setInputUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const videoId = extractVideoId(inputUrl);
    if (videoId) {
      setVideoUrl(`https://www.youtube.com/embed/${videoId}`);
      setInputUrl("");
    }
  };

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="video-section">
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <Input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          placeholder="Cole o link do YouTube aqui"
          className="flex-1"
        />
        <Button type="submit">Carregar Vídeo</Button>
      </form>

      {videoUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <iframe
            src={videoUrl}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;
