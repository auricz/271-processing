import { loadImage } from "./loadImage"

export async function preprocessImage(file) {

  const img = await loadImage(file)

  const src = cv.imread(img)
  const gray = new cv.Mat()

  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY)

  const resized = new cv.Mat()

  cv.resize(
    gray,
    resized,
    new cv.Size(0,0),
    2,
    2,
    cv.INTER_CUBIC
  )

  const canvas = document.createElement("canvas")

  cv.imshow(canvas, resized)

  src.delete()
  gray.delete()
  resized.delete()

  return canvas
}