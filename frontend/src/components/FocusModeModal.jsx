import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";

const musicLibrary = [
    { label: "Rain", src: "/sounds/rain.mp3" },
    { label: "Cafe", src: "/sounds/cafe.mp3" },
    { label: "Forest", src: "/sounds/forest.mp3" },
    { label: "White Noise", src: "/sounds/whitenoise.mp3" }
];

export default function FocusModeModal({ open, onClose, onOpen }) {
    const location = useLocation();
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState(musicLibrary[0]);
    const audioRef = useRef(null);
    const [volume, setVolume] = useState(0.5);
    const [isActiveMusic, setIsActiveMusic] = useState(false);

    // Draggable widget state
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const offsetStart = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        if (e.button !== 0 || e.target.closest('button')) return;
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        offsetStart.current = { ...dragOffset };
        e.preventDefault();
    };

    React.useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            const dx = e.clientX - dragStart.current.x;
            const dy = e.clientY - dragStart.current.y;
            setDragOffset({
                x: offsetStart.current.x + dx,
                y: offsetStart.current.y + dy
            });
        };

        const handleMouseUp = (e) => {
            setIsDragging(false);
            
            // Calculate distance moved
            const dx = Math.abs(e.clientX - dragStart.current.x);
            const dy = Math.abs(e.clientY - dragStart.current.y);
            
            // If moved less than 5px, treat as click to open main modal
            if (dx < 5 && dy < 5) {
                if (onOpen) onOpen();
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, onOpen]);

    React.useEffect(() => {
        const token = localStorage.getItem("token");
        const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

        if (!token || isAuthPage) {
            setIsActive(false);
            setSeconds(0);
            if (audioRef.current) {
                audioRef.current.pause();
            }
            setIsActiveMusic(false);
        }
    }, [location]);

    const handleWidgetClose = () => {
        setIsActive(false);
        setSeconds(0);
        if (audioRef.current) {
            audioRef.current.pause();
        }
        setIsActiveMusic(false);
        setDragOffset({ x: 0, y: 0 });
    };

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

    React.useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.load();
            if (isActiveMusic) {
                audio.play().catch((err) => console.error("Audio play failed:", err));
            }
        }
    }, [selectedTrack]);

    const formatTime = (s) => {
        const h = String(Math.floor(s / 3600)).padStart(2, "0");
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
        const sec = String(s % 60).padStart(2, "0");
        return `${h}:${m}:${sec}`;
    };

    return (
        <>
            {/* Main Modal Overlay */}
            {open && (
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
                                }}>
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
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Mini Widget */}
            {!open && (seconds > 0 || isActiveMusic) && (
                <div 
                    className="focus-floating-widget"
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                        zIndex: 2000,
                        cursor: isDragging ? 'grabbing' : 'grab'
                    }}
                    onMouseDown={handleMouseDown}
                >
                    <button className="widget-close" onClick={handleWidgetClose}>×</button>
                    <div className="widget-drag-handle">⏱ Focused Reading</div>
                    <div className="widget-content">
                        {/* Timer Section */}
                        {seconds > 0 && (
                            <div className="widget-timer-section">
                                <span className="widget-icon">⏱</span>
                                <span className="widget-time">{formatTime(seconds)}</span>
                                <button className="widget-icon-btn" onClick={() => setIsActive(!isActive)}>
                                    {isActive ? '❚❚' : '▶'}
                                </button>
                            </div>
                        )}
                        {/* Audio Section */}
                        {isActiveMusic && (
                            <div className="widget-audio-section">
                                <span className="widget-icon">🎵</span>
                                <span className="widget-track-name" title={selectedTrack.label}>{selectedTrack.label}</span>
                                <button className="widget-icon-btn" onClick={() => {
                                    if (audioRef.current.paused) {
                                        audioRef.current.play();
                                        setIsActiveMusic(true);
                                    } else {
                                        audioRef.current.pause();
                                        setIsActiveMusic(false);
                                    }
                                }}>
                                    {isActiveMusic ? '❚❚' : '▶'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Persistent Audio Element */}
            <audio ref={audioRef} loop>
                <source src={selectedTrack.src} type="audio/mp3" />
                Your browser does not support the audio element.
            </audio>
        </>
    );
}