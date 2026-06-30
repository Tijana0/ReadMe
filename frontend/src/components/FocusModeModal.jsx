import React, { useState, useRef } from "react";

const musicLibrary = [
    { label: "Rain", src: "/sounds/rain.mp3" },
    { label: "Cafe", src: "/sounds/cafe.mp3" },
    { label: "Forest", src: "/sounds/forest.mp3" },
    { label: "White Noise", src: "/sounds/whitenoise.mp3" }
];

export default function FocusModeModal({ open, onClose }) {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState(musicLibrary[0]);
    const audioRef = useRef(null);
    const [volume, setVolume] = useState(0.5);
    const [isActiveMusic, setIsActiveMusic] = useState(false);

    React.useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => setSeconds((s) => s + 1), 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    React.useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = volume;

            const handlePlay = () => setIsActiveMusic(true);
            const handlePause = () => setIsActiveMusic(false);

            audio.addEventListener('play', handlePlay);
            audio.addEventListener('pause', handlePause);

            return () => {
                audio.removeEventListener('play', handlePlay);
                audio.removeEventListener('pause', handlePause);
            };
        }
    }, [audioRef, volume]);

    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    const formatTime = (s) => {
        const h = String(Math.floor(s / 3600)).padStart(2, "0");
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
        const sec = String(s % 60).padStart(2, "0");
        return `${h}:${m}:${sec}`;
    };

    if (!open) return null;

    return (
        <div className="focus-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000 }}>
            <div className="focus-modal">
                <button className="focus-modal-close" onClick={onClose}>×</button>
                <h2>FOCUS MODE</h2>
                <div className="focus-timer">{formatTime(seconds)}</div>
                <div className="focus-controls">
                    <button onClick={() => setIsActive(true)} disabled={isActive}>Start Reading</button>
                    <button onClick={() => setIsActive(false)} disabled={!isActive}>Pause</button>
                    <button onClick={() => { setSeconds(0); setIsActive(false); }}>Reset</button>
                </div>
                <div className="focus-music">
                    <label>
                        <span role="img" aria-label="music">🎵</span> Background Music
                        <select
                            value={selectedTrack.label}
                            onChange={e => {
                                const track = musicLibrary.find(t => t.label === e.target.value);
                                setSelectedTrack(track);
                                if (audioRef.current) {
                                    audioRef.current.load();
                                }
                            }}
                        >
                            {musicLibrary.map((track) => (
                                <option key={track.label} value={track.label}>{track.label}</option>
                            ))}
                        </select>
                    </label>
                    <div className="custom-audio-player">
                        <button onClick={() => {
                            if (audioRef.current.paused) {
                                audioRef.current.play();
                                setIsActiveMusic(true);
                            } else {
                                audioRef.current.pause();
                                setIsActiveMusic(false);
                            }
                        }} className={!isActiveMusic ? "" : ""}>
                            {isActiveMusic ? '❚❚' : '▶'}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={e => {
                                setVolume(parseFloat(e.target.value));
                                audioRef.current.volume = parseFloat(e.target.value);
                            }}
                            className="volume-slider"
                        />
                        <audio ref={audioRef} loop>
                            <source src={selectedTrack.src} type="audio/mp3" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                </div>
            </div>
        </div>
    );
}