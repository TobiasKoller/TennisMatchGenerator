using TennisMatchGenerator.Views;

namespace TennisMatchGenerator;

public partial class App : Application
{
	public App()
	{
        Syncfusion.Licensing.SyncfusionLicenseProvider.RegisterLicense("Ngo9BigBOggjHTQxAR8/V1NCaF5cXmZCeEx0Qnxbf1x0ZFBMYVlbRnBPIiBoS35RckVlW39fd3VQRGZeUkZx");

        InitializeComponent();

		MainPage = new MainPage();//new AppShell();
	}
}
