import models.Client;
import play.Application;
import play.GlobalSettings;
import play.Logger;
import play.db.jpa.JPA;
import play.db.jpa.Transactional;
import play.libs.F.Promise;
import play.mvc.Action;
import play.mvc.Http;
import play.mvc.Result;

public class Global extends GlobalSettings {

	
    private class ActionWrapper extends Action.Simple {
        public ActionWrapper(Action<?> action) {
            this.delegate = action;
        }

        @Override
        public Promise<Result> call(Http.Context ctx) throws java.lang.Throwable {
            Promise<Result> result = this.delegate.call(ctx);
            Http.Response response = ctx.response();
            Logger.info("Change header");
            response.setHeader("Access-Control-Allow-Origin", "*");
            return result;
        }
    }

    @Override
    public Action<?> onRequest(Http.Request request, java.lang.reflect.Method actionMethod) {
        return new ActionWrapper(super.onRequest(request, actionMethod));
    }

    public void onStart(Application app) {
        Logger.info("Application has started");
    }
}