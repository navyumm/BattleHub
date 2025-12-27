import ColorThief from "colorthief";

export const getColorPalette = (
  imgSrc: string,
  colorCount = 2
): Promise<string[]> => {
  return new Promise((resolve) => {
    const img = new Image();

    // ❌ crossOrigin hata diya
    img.src = imgSrc;

    img.onload = () => {
      try {
        const colorThief = new ColorThief();
        const palette: number[][] = colorThief.getPalette(img, colorCount);

        const hexPalette = palette.map((rgb) =>
          "#" +
          rgb
            .map((c) => c.toString(16).padStart(2, "0").toUpperCase())
            .join("")
        );

        resolve(hexPalette);
      } catch (err) {
        console.error("Color extraction failed:", err);
        resolve([]);
      }
    };

    img.onerror = () => {
      console.error("Image failed to load for color extraction", imgSrc);
      resolve([]);
    };
  });
};
