export function useShareQuote() {
  return (text: string) => {
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Quote copied to clipboard!");
    }
  };
}
