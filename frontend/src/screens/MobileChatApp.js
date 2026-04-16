import React, { useEffect } from 'react';
import SanjeevaniChatbot from '../components/SanjeevaniChatbot';

const MobileChatApp = () => {

    useEffect(() => {
        // Set document title for the installed PWA
        document.title = "Sanjeevani AI";

        // Set theme color for the mobile browser chrome
        let themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) {
            themeColor.setAttribute("content", "#1b5e20");
        } else {
            themeColor = document.createElement('meta');
            themeColor.setAttribute('name', 'theme-color');
            themeColor.setAttribute('content', '#1b5e20');
            document.head.appendChild(themeColor);
        }

        // Ensure viewport is configured properly for mobile PWA (no zoom, safe areas)
        let viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
        }

        // Lock body scroll to prevent rubber-banding on iOS
        const prevOverflow = document.body.style.overflow;
        const prevHeight = document.body.style.height;
        const prevPosition = document.body.style.position;
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100%';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100%';

        return () => {
            // Cleanup when navigating away
            document.body.style.overflow = prevOverflow;
            document.body.style.height = prevHeight;
            document.body.style.position = prevPosition;
            document.body.style.width = '';
            document.documentElement.style.overflow = '';
            document.documentElement.style.height = '';
        };
    }, []);

    return <SanjeevaniChatbot isFullScreen={true} />;
};

export default MobileChatApp;
