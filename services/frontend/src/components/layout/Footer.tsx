export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Коворкинг Братюни. Все права защищены.</p>
          <p className="mt-2">
            Система бронирования коворкинга
          </p>
        </div>
      </div>
    </footer>
  );
}
