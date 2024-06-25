using Microsoft.Extensions.Logging;
using Syncfusion.Maui.Core.Hosting;
using CommunityToolkit.Maui;

namespace TennisMatchGenerator;

public static class MauiProgram
{
	public static MauiApp CreateMauiApp()
	{
        var builder = MauiApp.CreateBuilder();
        builder
        .UseMauiApp<App>()
        .UseMauiCommunityToolkit()
        .ConfigureSyncfusionCore()
        .ConfigureFonts(fonts =>
        {
            fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
        });

        return builder.Build();
//        var builder = MauiApp.CreateBuilder();
//		builder
//			.UseMauiApp<App>()
//			.ConfigureFonts(fonts =>
//			{
//				fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
//				fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
//			});

//#if DEBUG
//		builder.Logging.AddDebug();
//#endif

		//return builder.Build();
	}
}
