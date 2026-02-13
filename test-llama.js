import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

async function test() {
  const pdfPath =
    "D:\\Documents\\CODE_WITH_ERICADESHH\\GitHub\\AfyaConnect\\frontend\\Untitled document.pdf";

  try {
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at: ${pdfPath}`);
    }

    const form = new FormData();
    form.append("file", fs.createReadStream(pdfPath));

    const res = await fetch(
      "https://api.cloud.llamaindex.ai/api/v1/parsing/upload",
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer llx-E65vaGXTGMTYukcmMb01iBWaKRcY1D35JOQIk7gcJM3OS7up",
        },
        body: form,
      },
    );

    const status = res.status;
    const text = await res.text();

    console.log(`Status: ${status}`);
    console.log("Response:", text);

    if (status === 401) {
      console.log(
        "\n401 means the API key is invalid, expired, or not activated.",
      );
      console.log(
        "Go to https://cloud.llamaindex.ai → API Keys → generate a new key.",
      );
      console.log(
        "Also check if you need to verify email / add payment method for free tier.",
      );
    }
  } catch (err) {
    console.error("Test failed:", err.message);
  }
}

test();
