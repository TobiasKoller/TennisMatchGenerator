using TennisMatchGenerator.Models;
using TennisMatchGenerator.ViewModel;

namespace TennisMatchGenerator;

public partial class MainPage : TabbedPage
{
	//int count = 0;

	public MatchDay MatchDay { get; set; }

	public MainPage()
	{
        InitializeComponent();

		BindingContext = new MainViewModel();
    }



	//private void OnCounterClicked(object sender, EventArgs e)
	//{
		//count++;

		//if (count == 1)
		//	CounterBtn.Text = $"Clicked {count} time";
		//else
		//	CounterBtn.Text = $"Clicked {count} times";

		//SemanticScreenReader.Announce(CounterBtn.Text);
	//}
}

