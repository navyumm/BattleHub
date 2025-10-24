import resemble from "resemblejs";

export const compareImages = (targetImage: string, previewImage: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    resemble(targetImage)
      .compareTo(previewImage)
      .ignoreColors()
      .onComplete((data: any) => {
        if (data.misMatchPercentage !== undefined) {
          const similarity = 100 - parseFloat(data.misMatchPercentage);
          resolve(Number(similarity.toFixed(2)));
        } else {
          reject("Comparison failed");
        }
      });
  });
};
