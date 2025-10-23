export default async function compareImage(userCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement): Promise<number> {
  if (!userCanvas || !targetCanvas) return 0;

  // Resize canvases to common size
  const width = 400;  // fixed comparison width
  const height = 400; // fixed comparison height

  // Create temporary canvases for resizing
  const tmpUserCanvas = document.createElement("canvas");
  tmpUserCanvas.width = width;
  tmpUserCanvas.height = height;
  const tmpUserCtx = tmpUserCanvas.getContext("2d");

  const tmpTargetCanvas = document.createElement("canvas");
  tmpTargetCanvas.width = width;
  tmpTargetCanvas.height = height;
  const tmpTargetCtx = tmpTargetCanvas.getContext("2d");

  if (!tmpUserCtx || !tmpTargetCtx) return 0;

  // Draw and resize
  tmpUserCtx.drawImage(userCanvas, 0, 0, width, height);
  tmpTargetCtx.drawImage(targetCanvas, 0, 0, width, height);

  const userData = tmpUserCtx.getImageData(0, 0, width, height).data;
  const targetData = tmpTargetCtx.getImageData(0, 0, width, height).data;

  let matchedPixels = 0;
  const totalPixels = width * height;

  for (let i = 0; i < userData.length; i += 4) {
    const rDiff = Math.abs(userData[i] - targetData[i]);
    const gDiff = Math.abs(userData[i + 1] - targetData[i + 1]);
    const bDiff = Math.abs(userData[i + 2] - targetData[i + 2]);
    const aDiff = Math.abs(userData[i + 3] - targetData[i + 3]);

    // consider pixel matched if RGBA differences are small
    if (rDiff < 10 && gDiff < 10 && bDiff < 10 && aDiff < 10) {
      matchedPixels++;
    }
  }

  const percentage = Math.round((matchedPixels / totalPixels) * 100);
  return percentage;
}
