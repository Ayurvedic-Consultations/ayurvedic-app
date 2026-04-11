import React, { useEffect } from 'react';
import SanjeevaniChatbot from '../components/SanjeevaniChatbot';

const MobileChatApp = () => {

    useEffect(() => {
        // Change meta tags to hide browser UI if running as a web app on mobile
        document.title = "Sanjeevani Assistant";
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) themeColor.setAttribute("content", "#1b5e20");
        else {
            const el = document.createElement('meta');
            el.setAttribute('name', 'theme-color');
            el.setAttribute('content', '#1b5e20');
            document.head.appendChild(el);
        }
    }, []);

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#e8f5e9' }}>
            <SanjeevaniChatbot isFullScreen={true} />
        </div>
    );
};

export default MobileChatApp;
