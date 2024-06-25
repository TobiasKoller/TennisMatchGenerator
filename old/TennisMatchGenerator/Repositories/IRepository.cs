namespace TennisMatchGenerator.Repositories
{
    public interface IRepository
    {
        Guid Create<T>(T entry);
        T Get<T>(Guid id);
        List<T> GetAll<T>();
        bool Update<T>(T entry);
        bool Delete<T>(Guid id);
    }
}
