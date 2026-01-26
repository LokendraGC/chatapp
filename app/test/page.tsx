import Script from "next/script";

export default function TestPage() {
  return (
    <div>
      <Script
        src="http://localhost:3000/widget.js"
        data-id="59f6e505-003b-40f1-9669-ea3cf998bf10"
      ></Script>
    </div>
  );
}
