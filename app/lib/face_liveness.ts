import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@aws-amplify/ui-react";
import { FaceLivenessDetectorCore } from "@aws-amplify/ui-react-liveness";
import amplifyCss from "@aws-amplify/ui-react-liveness/styles.css?inline";
import type { ApiLivenessSession } from "~/models/auth_model";

/**
 * AWS Amplify's face-liveness detector is a React component; this mounts it as a small React
 * island inside a Vue page. Browser only, and imported only at the face-capture step.
 *
 * It renders inside a shadow root with Amplify's stylesheet: that stylesheet sets fonts on
 * `html`, line height on `body` and styles every `input`, which would otherwise restyle the
 * whole site for the rest of the visit.
 */

/** Amplify's theme variables, pointed at the marketplace's font and purple. */
const THEME_OVERRIDES = `
[data-amplify-theme] {
  --amplify-fonts-default-static: "Geist", Inter, system-ui, sans-serif;
  --amplify-fonts-default-variable: "Geist", Inter, system-ui, sans-serif;
  --amplify-colors-primary-10: #f3f1ff;
  --amplify-colors-primary-20: #e4deff;
  --amplify-colors-primary-40: #b4a6ff;
  --amplify-colors-primary-60: #917cff;
  --amplify-colors-primary-80: #7a68d6;
  --amplify-colors-primary-90: #6354ad;
  --amplify-colors-primary-100: #4b4085;
}`;

export interface FaceLivenessHandlers {
  /** The capture finished; ask our API for the result. */
  onComplete: () => void;
  /** `state` is Amplify's error type, e.g. CAMERA_ACCESS_ERROR or TIMEOUT. */
  onError: (state: string, message: string) => void;
  onCancel: () => void;
}

/** Mounts the detector into `host`. Returns a function that unmounts it. */
export function mountFaceLiveness(host: HTMLElement, session: ApiLivenessSession, handlers: FaceLivenessHandlers) {
  const shadow = host.shadowRoot ?? host.attachShadow({ mode: "open" });
  shadow.replaceChildren();
  const style = document.createElement("style");
  style.textContent = amplifyCss + THEME_OVERRIDES;
  const container = document.createElement("div");
  shadow.append(style, container);

  const { accessKeyId, secretAccessKey, sessionToken, expiration } = session.credentials;
  const root = createRoot(container);
  root.render(
    createElement(
      ThemeProvider,
      null,
      createElement(FaceLivenessDetectorCore, {
        sessionId: session.livenessSessionId,
        region: session.region,
        onAnalysisComplete: async () => handlers.onComplete(),
        onError: (error) => handlers.onError(String(error.state), error.error?.message ?? ""),
        onUserCancel: () => handlers.onCancel(),
        // The API hands out short-lived AWS credentials for this one session; no Cognito needed.
        config: {
          credentialProvider: async () => ({
            accessKeyId,
            secretAccessKey,
            sessionToken,
            expiration: new Date(expiration),
          }),
        },
      }),
    ),
  );

  return () => {
    root.unmount();
    shadow.replaceChildren();
  };
}
