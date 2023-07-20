const authService = {
  checkForApprovedEmailDomain(req, context) {
    const header = req.headers["x-ms-client-principal"];
    const encoded = Buffer.from(header, "base64");
    const decoded = encoded.toString("ascii");
    const clientPrincipal = JSON.parse(decoded);

    const domainIsApproved =
      clientPrincipal.userDetails &&
      clientPrincipal.userDetails.endsWith("@microsoft.com");

    if (!domainIsApproved) {
      context.res = {
        status: 401,
        body: "Unauthorized",
      };
    }
  },
};

module.exports = authService;
