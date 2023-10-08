const createElement = (element, attrs = {}) => Object.assign(document.createElement(element), attrs);

const state = {
  slideIndex: 0,
  slideImages: ["/images/slide01.jpg", "/images/slide02.jpg", "/images/slide03.png"],
  canvasImages: [],
  get currentSlideImage() {
    return this.canvasImages[this.slideIndex];
  },
};
const $canvas = createElement("canvas", {
  width: window.innerWidth,
  height: window.innerHeight,
});
const context = $canvas.getContext("2d");

async function getImage(imagePath) {
  return new Promise((resolve) => {
    const $image = new Image();
    $image.src = imagePath;
    $image.onload = () => {
      const canvasRect = [$canvas.width, $canvas.height];
      const imageRect = [$image.width, $image.height];
      const [canvasWidth, canvasHeight] = canvasRect;
      const [imageWidth, imageHeight] = imageRect;

      const [radioX, radioY] = getRatio(imageWidth, imageHeight);
      const maxDivisor = Math.max(canvasWidth / radioX, canvasHeight / radioY);

      resolve({
        $image,
        imagePath,
        width: maxDivisor * radioX,
        height: maxDivisor * radioY,
      });
    };
  });
}
async function setCanvasImages() {
  state.canvasImages = await Promise.all(state.slideImages.map((imagePath) => getImage(imagePath)));
}

function getRatio(width, height) {
  // 최대 공약수 찾기 함수
  function gcd(a, b) {
    return b == 0 ? a : gcd(b, a % b);
  }

  const divisor = gcd(width, height);
  return [width / divisor, height / divisor, divisor];
}

function renderSlide() {
  const slideImage = state.currentSlideImage;
  const { $image, width, height } = slideImage;
  context.drawImage($image, 0, 0, width, height);
}

async function init() {
  await setCanvasImages();
  setInterval(function () {
    if (++state.slideIndex === state.slideImages.length) state.slideIndex = 0;
    renderSlide();
  }, 3000);
  renderSlide();
}
init();
document.body.append($canvas);
