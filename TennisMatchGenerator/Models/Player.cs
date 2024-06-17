using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TennisMatchGenerator.Models
{
    public class Player : ModelBase
    {
        public string FirstName { get; set; } = "";
        public string LastName { get; set; } = "";
        public int Age { get; set; }
        public double LK {  get; set; }
        public int TotalPoints { get; set; }
    }
}
