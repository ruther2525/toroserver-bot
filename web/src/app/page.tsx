export default function Home() {
    return (
        <main style={{
            width: "100%",
            height: "80vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <h1>
                とろサーBotのページです。
            </h1>
            <p>
                とろサーメンバー限定のページです。
                使用するには右上のボタンからログインしてください。
            </p>
        </main>
    );
}
