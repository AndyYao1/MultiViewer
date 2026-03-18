export default function ChatBox({stream}: {stream: string}) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const srcURL = `https://www.twitch.tv/embed/${stream}/chat?parent=localhost`
    const srcURLDark = `https://www.twitch.tv/embed/${stream}/chat?parent=localhost&darkpopout`

    return (
        <iframe 
            src={prefersDark ? srcURLDark : srcURL}
            height={"100%"}
            width={"100%"}
        />
    );
}