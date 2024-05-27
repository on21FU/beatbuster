export function AudioVisualization({ duration, amountOfTiles = 100 }: { duration: number, amountOfTiles?: number }) {
    return <div className="audioViz">
        {
            Array.from({ length: amountOfTiles }).map((_, index) => {
                return <div
                    className="greenParts"
                    key={index}
                    style={{
                        width: `${100 / amountOfTiles}%`,
                        height: `${Math.random() * 70 + 40}px`,
                        animationDelay: `${Math.random() / 2}s, ${index * duration / amountOfTiles}s`,
                        animationDuration: `${Math.random() + 1}s, 0.5s`
                    }}>
                </div>
            })
        }
    </div>
}