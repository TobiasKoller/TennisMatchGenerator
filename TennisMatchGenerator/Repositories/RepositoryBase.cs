namespace TennisMatchGenerator.Repositories
{


    public abstract class RepositoryBase : IRepository
    {
        public RepositoryBase() { }

        public Guid Create<T>(T entry)
        {
            throw new NotImplementedException();
        }

        public bool Delete<T>(Guid id)
        {
            throw new NotImplementedException();
        }

        public T Get<T>(Guid id)
        {
            throw new NotImplementedException();
        }

        public bool Update<T>(T entry)
        {
            throw new NotImplementedException();
        }
    }
}
