package api

import (
	"net/http"

	contextmodel "github.com/grafana/grafana/pkg/services/contexthandler/model"
)

func (hs *HTTPServer) GetFeatureToggles(c *contextmodel.ReqContext) {
	c.JSON(http.StatusOK, hs.Features.GetResolvedState(c.Req.Context()))
}
