/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                background: '#1A1818',
                surface: '#252121',
                primary: '#E53B0A',
                primaryLight: '#FF5C2A',
                text: '#FFFFFF',
                textSecondary: '#A5A2A2',
                border: '#453E3E',
            }
        },
    },
    plugins: [],
}
