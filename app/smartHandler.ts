import { LAUNCH } from "@TopologyHealth/smarterfhir/src/Client/ClientFactory";
import { EMR_ENDPOINTS } from "@TopologyHealth/smarterfhir/src/Client/BaseClient";
import EpicClient from "@TopologyHealth/smarterfhir/src/Client/EpicClient";
import CernerClient from "@TopologyHealth/smarterfhir/src/Client/CernerClient";
import { EMR } from "@TopologyHealth/smarterfhir/src/Launcher/SmartLaunchHandler";
import { buildCodeAsync } from "expo-auth-session/src/PKCE";

export default class SmartLaunchHandlerNative {
  /**
   * The client ID for the SmartLaunchHandler.
   * @readonly
   */
  readonly clientID: string;
  readonly usePKCE?: boolean;

  public codeVerifier?: string;
  public codeChallenge?: string;

  /**
   * Creates an instance of SmartLaunchHandler.
   * @param {string} clientID - The client ID to use for authorization.
   * @param usePKCE
   */
  constructor(clientID: string, usePKCE?: boolean) {
    this.clientID = clientID;
    this.usePKCE = usePKCE ?? false;
  }

  /**
   * Authorizes the EMR based on the current URL query parameters.
   * @returns {Promise<void>} - A promise resolving to void.
   */
  async authorizeEMR(
    launchType: LAUNCH = LAUNCH.EMR,
    emrType?: EMR,
    redirectUriOverride?: string,
  ): Promise<void> {
    if (this.usePKCE) {
      const { codeChallenge, codeVerifier } = await buildCodeAsync();
      this.codeChallenge = codeChallenge;
      this.codeVerifier = codeVerifier;
    }

    if (launchType === LAUNCH.EMR) {
      return;
    }
    if (launchType === LAUNCH.STANDALONE) {
      return this.executeStandaloneLaunch(emrType, redirectUriOverride);
    }
    throw new Error("Invalid Smart Launch Type");
  }

  /**
   * The function `executeStandaloneLaunch` is used to launch a standalone application for a specific EMR type, with an optional redirect URI override.
   * @param {EMR | undefined} emrType - The `emrType` parameter is of type `EMR`, which is an enumeration representing different types of EMR (Electronic Medical
   * Record) systems. It can have the following values:
   * @param {string | undefined} redirectUriOverride - The `redirectUriOverride` parameter is a string that represents the URL where the user should be redirected
   * after the standalone launch is completed. If this parameter is not provided, the default value is set to the current URL of the window.
   * @returns Nothing is being returned. The function has a return type of `void`, which means it does not return any value.
   */
  private executeStandaloneLaunch(
    emrType: EMR | undefined,
    redirectUriOverride: string | undefined,
  ) {
    if (!emrType)
      throw new Error("EmrType must be specified for Standalone Launch");
    const redirectUri =
      redirectUriOverride ?? window.location.origin + window.location.pathname;
    const standaloneUrl = this.generateStandaloneUrl(emrType, redirectUri);
    switch (emrType) {
      case EMR.EPIC:
      case EMR.CERNER:
      case EMR.SMART:
        window.location.href = standaloneUrl;
        break;
      case EMR.NONE:
      default:
        throw new Error("This EMR is not supported for standalone launch");
    }
    return;
  }

  /**
   * The function generates a standalone URL for a given EMR type, redirect URI, and client ID.
   * @param {EMR} emrType - The `emrType` parameter represents the type of EMR (Electronic Medical Record) system. It is of type `EMR`.
   * @param {string} redirectUri - The `redirectUri` parameter is the URL where the user will be redirected to after completing the authentication process.
   * @returns a URL string.
   */
  private generateStandaloneUrl(emrType: EMR, redirectUri: string) {
    const { r4: r4Endpoint, auth: authEndpoint } =
      this.getEndpointsForEmr(emrType);
    const r4EndpointBase64 = btoa(r4Endpoint.toString());
    let code_challenge_query = "";
    if (this.codeChallenge) {
      code_challenge_query = `&code_challenge=${this.codeChallenge}&code_challenge_method=S256`;
    }
    return `${authEndpoint}?response_type=code&redirect_uri=${redirectUri}&client_id=${this.clientID}&aud=${r4EndpointBase64}${code_challenge_query}`;
  }

  /**
   * The function `getEndpointsForEmr` returns the endpoints for a given EMR type, such as Epic, Cerner, or SMART.
   * @param {EMR} emrType - The `emrType` parameter is of type `EMR`, which is an enumeration representing different types of Electronic Medical Record (EMR)
   * systems. The possible values for `emrType` are `EMR.EPIC`, `EMR.CERNER`, `EMR.SMART`,
   * @returns an object of type EMR_ENDPOINTS.
   */
  private getEndpointsForEmr(emrType: EMR): EMR_ENDPOINTS {
    switch (emrType) {
      case EMR.EPIC:
        return EpicClient.getEndpoints();
      case EMR.CERNER:
        return CernerClient.getEndpoints();
      case EMR.SMART:
      case EMR.NONE:
      default:
        throw new Error(`Endpoints not found for EMR type: ${emrType}`);
    }
  }
}
