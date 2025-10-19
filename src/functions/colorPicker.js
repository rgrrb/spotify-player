async function getDominantColorFromImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Importante para evitar erro de CORS
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;

      // Desenha a imagem no canvas
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Coleta os dados dos pixels
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;

      let r = 0, g = 0, b = 0;
      const totalPixels = img.width * img.height;

      // Soma todos os valores de cor
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];     // Red
        g += data[i + 1]; // Green
        b += data[i + 2]; // Blue
      }

      // Calcula a média para cada canal de cor
      r = Math.round(r / totalPixels);
      g = Math.round(g / totalPixels);
      b = Math.round(b / totalPixels);
      
      // --- ALTERAÇÃO AQUI ---
      // Em vez de converter para hex, resolve com um objeto RGB
      resolve({ r, g, b });
    };

    img.onerror = reject;
  });
}