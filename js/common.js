const createElement = (element, attrs = {}) => Object.assign(document.createElement(element), attrs);

const state = {
  slideIndex: 0,
  slideImages: ["/images/slide01.png", "/images/slide02.jpg", "/images/slide03.jpg"],
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
  const $backgroundCanvas = createElement("canvas", {
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const backgroundContext = $backgroundCanvas.getContext("2d");
  const slideImages = await Promise.all(state.slideImages.map((imagePath) => getImage(imagePath)));
  state.canvasImages = slideImages.map((slideImage) => {
    const { $image, width, height } = slideImage;
    backgroundContext.drawImage($image, 0, 0, width, height);
    slideImage.datas = backgroundContext.getImageData(0, 0, $canvas.width, $canvas.height).data;
    slideImage.colors = slideImage.datas.reduce(
      (acc, rgba, index) => {
        acc.color.push(rgba);
        if ((index + 1) % 4 === 0) {
          acc.colors.push(acc.color);
          acc.color = [];
        }

        return acc;
      },
      { colors: [], color: [] }
    ).colors;
    return slideImage;
  });
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
  const canvasWidth = $canvas.width;
  const canvasHeight = $canvas.height;
  const limit = 500;
  const limitPlus = 10;
  slideImage.colors.slice(canvasWidth * limit, canvasWidth * (limit + limitPlus)).forEach(([r, g, b], index) => {
    const x = index % canvasWidth;
    const y = Math.floor(index / canvasWidth);

    context.fillStyle = `rgba(${r},${g},${b},255)`;

    context.rect(x, y + limit, 1, 1);
    context.fill();
  });
}

async function init() {
  console.time("settings");
  await setCanvasImages();
  console.timeEnd("settings");
  /* setInterval(function () {
      if (++state.slideIndex === state.slideImages.length) state.slideIndex = 0;
      renderSlide();
    }, 3000); */
  //   console.time("render");
  //   console.log(state.canvasImages);
  console.time("render");
  renderSlide();
  console.timeEnd("render");
  //   console.timeEnd("render");
}
init();
document.body.append($canvas);
