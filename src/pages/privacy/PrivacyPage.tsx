import { Link } from "react-router";
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
} from "react-icons/fi";
import { Layout } from "@/widgets/Layout";
import { Breadcrumbs } from "@/shared/ui/Breadcrumbs";
import { Button } from "@/shared/ui/Button";
import { openCookieSettings } from "@/shared/privacy/cookie-consent";

const sections = [
  { id: "general", number: "1", title: "Общие положения" },
  { id: "operator", number: "2", title: "Оператор персональных данных" },
  { id: "data-list", number: "3", title: "Перечень собираемых данных" },
  { id: "purposes", number: "4", title: "Цели обработки" },
  { id: "methods", number: "5", title: "Способы обработки" },
  { id: "storage", number: "6", title: "Сроки хранения" },
  { id: "third-party", number: "7", title: "Передача третьим лицам" },
  { id: "rights", number: "8", title: "Права субъекта" },
  { id: "consent", number: "9", title: "Согласие на обработку" },
  { id: "protection", number: "10", title: "Меры защиты" },
  { id: "cross-border", number: "11", title: "Трансграничная передача" },
  { id: "localStorage", number: "12", title: "Использование localStorage" },
  { id: "cookies", number: "12.1", title: "Cookies и аналитика" },
  { id: "changes", number: "13", title: "Изменение политики" },
  { id: "final", number: "14", title: "Заключительные положения" },
];

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left font-semibold text-foreground border-b border-border"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 text-muted-foreground border-b border-border/50"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PrivacyPage() {
  const breadcrumbs = [
    { label: "Главная", href: "/" },
    { label: "Политика конфиденциальности", href: undefined },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-10">
        <Breadcrumbs items={breadcrumbs} />

        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-1" />
            На главную
          </Link>

          <div className="flex items-start gap-4 mb-4">
            <div className="hidden md:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent-gradient text-white">
              <FiShield className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">
                Политика конфиденциальности
              </h1>
              <p className="text-muted-foreground">
                ООО «ИНВИА» • Обновлено 30 августа 2026 года
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 rounded-xl border border-border bg-card p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-2">
                Содержание
              </h3>
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-colors"
                    >
                      <span className="text-xs font-mono text-primary w-5">
                        {section.number}
                      </span>
                      <span className="line-clamp-2">{section.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          <div className="prose prose-neutral max-w-none">
            <section
              id="general"
              className="rounded-xl border border-border bg-card p-6 md:p-8 mb-6 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  1
                </span>
                Общие положения
              </h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  Настоящая Политика конфиденциальности (далее – Политика)
                  определяет порядок обработки и защиты персональных данных
                  пользователей сайта ООО «ИНВИА» (далее – Оператор).
                </p>
                <p>
                  Настоящая Политика разработана в соответствии с Федеральным
                  законом от 27.07.2006 № 152-ФЗ «О персональных данных» и иными
                  нормативными правовыми актами Российской Федерации в области
                  защиты персональных данных.
                </p>
                <p>
                  Используя сайт Оператора и заполняя формы обратной связи,
                  пользователь выражает своё согласие с условиями настоящей
                  Политики.
                </p>
              </div>
            </section>

            <section
              id="operator"
              className="rounded-xl border border-border bg-card p-6 md:p-8 mb-6 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  2
                </span>
                Оператор персональных данных
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-foreground">
                    Общество с ограниченной ответственностью «ИНВИА»
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Сокращённое наименование: ООО «ИНВИА»
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                    <FiMapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">
                        Юридический / фактический адрес
                      </p>
                      <p className="text-sm text-muted-foreground">
                        422549, Республика Татарстан, Зеленодольский район, г.
                        Зеленодольск, ул. Московская, зд. 4, помещ. 1
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                    <FiMail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">
                        Почтовый адрес
                      </p>
                      <p className="text-sm text-muted-foreground">
                        422540, г. Зеленодольск, а/я 34
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                    <FiPhone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">
                        Контактный телефон
                      </p>
                      <a
                        href="tel:+78432270005"
                        className="text-sm text-primary hover:underline"
                      >
                        +7 (843) 227-00-05
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                    <FiMail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">
                        Email для запросов по ПД
                      </p>
                      <a
                        href="mailto:zakaz@prorelsa.ru"
                        className="text-sm text-primary hover:underline"
                      >
                        zakaz@prorelsa.ru
                      </a>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">ОГРН</p>
                    <p className="text-sm font-mono font-semibold text-foreground">
                      1201600037055
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">ИНН</p>
                    <p className="text-sm font-mono font-semibold text-foreground">
                      1648052000
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">КПП</p>
                    <p className="text-sm font-mono font-semibold text-foreground">
                      164801001
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Директор:
                    </span>{" "}
                    Николаев Павел Николаевич
                  </p>
                </div>
              </div>
            </section>

            <section
              id="data-list"
              className="rounded-xl border border-border bg-card p-6 md:p-8 mb-6 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  3
                </span>
                Перечень собираемых персональных данных
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    3.1. Форма заявки (консультация / КП)
                  </h3>
                  <Table
                    headers={["Данные", "Обязательно", "Способ получения"]}
                    rows={[
                      ["Имя", "Да", "Ввод в форму"],
                      ["Телефон", "Да", "Ввод в форму"],
                      ["Email", "Да", "Ввод в форму"],
                      ["Комментарий (адрес доставки)", "Нет", "Ввод в форму"],
                      ["Файл заявки", "Нет", "Загрузка файла"],
                      ["Карта партнёра", "Нет", "Загрузка файла"],
                      ["Согласие на обработку ПД", "Да", "Чекбокс"],
                    ]}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    3.2. Форма оформления заказа
                  </h3>
                  <Table
                    headers={["Данные", "Обязательно", "Способ получения"]}
                    rows={[
                      ["Имя", "Да", "Ввод в форму"],
                      ["Телефон", "Да", "Ввод в форму"],
                      ["Email", "Да", "Ввод в форму"],
                      ["Адрес доставки", "Да", "Ввод в форму"],
                      ["Комментарий к заказу", "Нет", "Ввод в форму"],
                      ["Состав заказа", "Да", "Формируется из корзины"],
                      ["Сумма заказа", "Да", "Рассчитывается автоматически"],
                      ["Номер заказа", "Да", "Генерируется системой"],
                      ["Согласие на обработку ПД", "Да", "Чекбокс"],
                    ]}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    3.3. Технические данные (автоматический сбор)
                  </h3>
                  <Table
                    headers={["Данные", "Способ получения"]}
                    rows={[
                      ["IP-адрес", "Автоматически при посещении сайта"],
                      ["Данные браузера (User-Agent)", "Автоматически"],
                      ["Дата и время запросов", "Автоматически (логи сервера)"],
                      [
                        "Данные localStorage",
                        "Автоматически для сохранения состояния сайта",
                      ],
                    ]}
                  />

                  <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">Важно:</span> данные,
                      сохраняемые в localStorage, не передаются Оператору, не
                      обрабатываются им и используются исключительно для
                      обеспечения работы сайта в браузере пользователя.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="purposes"
              className="rounded-xl border border-border bg-card p-6 md:p-8 mb-6 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  4
                </span>
                Цели обработки персональных данных
              </h2>

              <div className="space-y-4">
                {[
                  {
                    title: "4.1. Обработка заявок",
                    data: "имя, телефон, email, комментарий, файлы",
                    purpose:
                      "подготовка коммерческого предложения, консультация, обратная связь",
                    basis:
                      "согласие субъекта ПД (ст. 6 ФЗ-152), исполнение договора",
                  },
                  {
                    title: "4.2. Оформление и исполнение заказов",
                    data: "имя, телефон, email, адрес, состав заказа, сумма",
                    purpose:
                      "оформление договора купли-продажи, доставка, информирование о статусе",
                    basis: "исполнение договора (п. 5 ч. 1 ст. 6 ФЗ-152)",
                  },
                  {
                    title: "4.3. Связь с пользователем",
                    data: "телефон, email",
                    purpose:
                      "уточнение деталей, информирование о статусе, ответы на вопросы",
                    basis: "согласие субъекта ПД, исполнение договора",
                  },
                  {
                    title: "4.4. Улучшение качества обслуживания",
                    data: "обезличенные данные о заявках и заказах",
                    purpose: "анализ спроса, улучшение работы сервиса",
                    basis:
                      "законный интерес оператора (п. 6 ч. 1 ст. 6 ФЗ-152)",
                  },
                  {
                    title: "4.5. Выполнение требований законодательства",
                    data: "все собранные персональные данные",
                    purpose:
                      "соблюдение налогового, бухгалтерского законодательства, ответы на запросы гос. органов",
                    basis:
                      "исполнение обязанностей, предусмотренных законом (п. 2 ч. 1 ст. 6 ФЗ-152)",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="p-4 rounded-lg bg-muted/30 border border-border space-y-2"
                  >
                    <h3 className="font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium text-foreground">
                          Данные:{" "}
                        </span>
                        <span className="text-muted-foreground">
                          {item.data}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-foreground">
                          Цель:{" "}
                        </span>
                        <span className="text-muted-foreground">
                          {item.purpose}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-foreground">
                          Основание:{" "}
                        </span>
                        <span className="text-muted-foreground">
                          {item.basis}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="methods"
              className="rounded-xl border border-border bg-card p-6 md:p-8 mb-6 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  5
                </span>
                Способы обработки персональных данных
              </h2>

              <p className="text-muted-foreground mb-4">
                Оператор осуществляет обработку персональных данных следующими
                способами:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {[
                  "сбор",
                  "запись",
                  "систематизация",
                  "накопление",
                  "хранение (серверы в РФ)",
                  "уточнение",
                  "извлечение",
                  "использование",
                  "передача",
                  "обезличивание",
                  "блокирование",
                  "удаление",
                  "уничтожение",
                ].map((method) => (
                  <div
                    key={method}
                    className="px-3 py-2 rounded-md bg-muted/30 border border-border text-sm text-muted-foreground text-center"
                  >
                    {method}
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                Обработка осуществляется с использованием средств автоматизации
                в информационно-телекоммуникационных сетях.
              </p>
            </section>

            <section
              id="storage"
              className="rounded-xl border border-border bg-card p-6 md:p-8 mb-6 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  6
                </span>
                Сроки хранения персональных данных
              </h2>

              <Table
                headers={["Категория данных", "Срок хранения"]}
                rows={[
                  ["Данные заявок", "До достижения целей, но не более 3 лет"],
                  [
                    "Данные заказов",
                    "5 лет (для бухгалтерского и налогового учёта)",
                  ],
                  [
                    "Файлы, прикреплённые к заявкам",
                    "До достижения целей, но не более 3 лет",
                  ],
                  ["Технические данные (логи)", "Не более 1 года"],
                  [
                    "Данные администраторов системы",
                    "До прекращения учётной записи",
                  ],
                ]}
              />
            </section>

            <section
              id="third-party"
              className="rounded-xl border border-border bg-card p-6 md:p-8 mb-6 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  7
                </span>
                Передача персональных данных третьим лицам
              </h2>

              <p className="text-muted-foreground mb-4">
                Оператор{" "}
                <strong className="text-foreground">не передаёт</strong>{" "}
                персональные данные пользователей каким-либо третьим лицам в
                коммерческих, маркетинговых или иных целях, не связанных с
                прямым исполнением обязательств перед пользователем.
              </p>

              <p className="text-muted-foreground mb-4">
                Передача персональных данных возможна{" "}
                <strong className="text-foreground">исключительно</strong> в
                следующих случаях:
              </p>

              <div className="space-y-3 mb-4">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="font-semibold text-foreground mb-1">
                    1. Хостинг-провайдеру
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Для обеспечения технического хранения данных на сервере.
                    Провайдер выступает в качестве обработчика ПД на основании
                    заключённого договора и обязуется соблюдать требования
                    ФЗ-152 в полном объёме.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="font-semibold text-foreground mb-1">
                    2. Государственным органам
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Исключительно по законным запросам (суд, налоговая
                    инспекция, полиция и иные уполномоченные органы) в порядке,
                    установленном законодательством РФ.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Важно:</span> поскольку
                  Оператор самостоятельно осуществляет все этапы взаимодействия
                  с пользователем (приём заявок, обработка заказов,
                  консультирование, доставка), передача данных службам доставки,
                  платёжным системам, рекламным или аналитическим агентствам не
                  производится.
                </p>
              </div>
            </section>

            <section
              id="rights"
              className="rounded-xl border border-border bg-card p-6 md:p-8 mb-6 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  8
                </span>
                Права субъекта персональных данных
              </h2>

              <p className="text-muted-foreground mb-4">
                В соответствии со ст. 14–21 ФЗ-152 пользователь имеет право:
              </p>

              <ol className="space-y-2 list-decimal list-inside text-muted-foreground mb-4">
                <li>
                  Получить информацию об обработке его персональных данных.
                </li>
                <li>
                  Требовать уточнения (обновления, изменения) персональных
                  данных.
                </li>
                <li>
                  Требовать блокирования или уничтожения персональных данных,
                  если они неполные, устаревшие, неточные или обрабатываются
                  незаконно.
                </li>
                <li>Отозвать согласие на обработку персональных данных.</li>
                <li>
                  Обжаловать действия оператора в Роскомнадзоре или в судебном
                  порядке.
                </li>
                <li>
                  Требовать прекращения обработки ПД в целях продвижения товаров
                  и услуг.
                </li>
              </ol>

              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Способ реализации прав:</span>{" "}
                  направить запрос на{" "}
                  <a
                    href="mailto:zakaz@prorelsa.ru"
                    className="text-primary hover:underline font-semibold"
                  >
                    zakaz@prorelsa.ru
                  </a>{" "}
                  или по почтовому адресу: 422540, г. Зеленодольск, а/я 34.
                </p>
              </div>
            </section>

            <section
              id="consent"
              className="rounded-xl border border-border bg-card p-6 md:p-8 mb-6 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  9
                </span>
                Согласие на обработку персональных данных
              </h2>

              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Согласие предоставляется путём проставления отметки в
                    чекбоксе при отправке формы.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Согласие может быть{" "}
                    <strong className="text-foreground">отозвано</strong> в
                    любой момент путём направления заявления на{" "}
                    <a
                      href="mailto:zakaz@prorelsa.ru"
                      className="text-primary hover:underline"
                    >
                      zakaz@prorelsa.ru
                    </a>
                    .
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    После отзыва обработка прекращается, за исключением случаев,
                    предусмотренных п. 2–11 ч. 1 ст. 6 ФЗ-152.
                  </span>
                </li>
              </ul>
            </section>

            <section
              id="protection"
              className="rounded-xl border border-border bg-card p-6 md:p-8 mb-6 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  10
                </span>
                Меры защиты персональных данных
              </h2>

              <p className="text-muted-foreground mb-4">
                В соответствии со ст. 18.1 и 19 ФЗ-152 Оператор принимает
                следующие меры:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "Назначение ответственного за обработку ПД",
                  "Организационные и технические меры защиты",
                  "Шифрование при передаче (HTTPS)",
                  "Хранение паролей в хешированном виде (bcrypt)",
                  "Разграничение доступа к ПД",
                  "Регулярное резервное копирование",
                  "Обнаружение и предотвращение несанкционированного доступа",
                ].map((measure) => (
                  <div
                    key={measure}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <span className="text-primary mt-0.5">✓</span>
                    <span className="text-sm text-foreground">{measure}</span>
                  </div>
                ))}
              </div>
            </section>

            <section
              id="cross-border"
              className="rounded-xl border border-border bg-card p-6 md:p-8 mb-6 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  11
                </span>
                Трансграничная передача
              </h2>

              <p className="text-muted-foreground">
                Персональные данные хранятся и обрабатываются{" "}
                <strong className="text-foreground">
                  на территории Российской Федерации
                </strong>{" "}
                в соответствии с ч. 5 ст. 18 ФЗ-152 (требование о локализации).
                Трансграничная передача персональных данных не осуществляется.
              </p>
            </section>

            <section
              id="localStorage"
              className="rounded-xl border border-border bg-card p-6 md:p-8 mb-6 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  12
                </span>
                Использование локального хранилища (localStorage)
              </h2>

              <div className="space-y-3 text-muted-foreground">
                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="font-semibold text-foreground mb-1">
                    Что хранится
                  </p>
                  <p className="text-sm">
                    Временная информация: содержимое корзины товаров, выбранные
                    фильтры, настройки отображения страниц, введённые данные
                    форм.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="font-semibold text-foreground mb-1">
                    Цель использования
                  </p>
                  <p className="text-sm">
                    Повышение удобства, сохранение состояния интерфейса между
                    сеансами, ускорение загрузки за счёт кэширования.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="font-semibold text-foreground mb-1">
                    Срок хранения
                  </p>
                  <p className="text-sm">
                    Бессрочно до тех пор, пока пользователь не очистит данные
                    вручную через настройки браузера.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="font-semibold text-foreground mb-1">
                    Передача третьим лицам
                  </p>
                  <p className="text-sm">
                    Не передаются. Остаются исключительно на устройстве
                    пользователя и не покидают его браузер.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/30 border border-border">
                  <p className="font-semibold text-foreground mb-1">
                    Управление
                  </p>
                  <p className="text-sm">
                    Пользователь может очистить данные localStorage через
                    настройки браузера (раздел «История» или
                    «Конфиденциальность»).
                  </p>
                </div>
              </div>

              <div id="cookies" className="mt-6 scroll-mt-24 rounded-lg border border-border bg-muted/30 p-4 sm:p-5">
                <h3 className="text-lg font-bold">Cookies и аналитика</h3>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <p>Необходимое хранилище браузера используется для корзины, входа в личный кабинет и сохранения настроек. Эти функции работают независимо от согласия на коллтрекинг.</p>
                  <p>Для анализа посещаемости на сайте у всех посетителей работает Яндекс Метрика. Она использует cookies и обрабатывает сведения о посещении сайта: адреса страниц, источник перехода, сведения об устройстве и браузере, действия на странице.</p>
                  <p>Gudok для коллтрекинга подключается только после выбора «Принять все». При выборе «Без коллтрекинга» его скрипт не загружается.</p>
                  <p>Выбор сохраняется в localStorage на один год. Его можно изменить в любой момент через «Настройки cookies» в подвале сайта. При отключении ранее разрешённого коллтрекинга страница перезагрузится без него. Удалить сохранённые cookies или запретить их можно в настройках браузера.</p>
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={openCookieSettings}>Настройки cookies</Button>
              </div>
            </section>

            <section
              id="changes"
              className="rounded-xl border border-border bg-card p-6 md:p-8 mb-6 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  13
                </span>
                Изменение политики конфиденциальности
              </h2>

              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Оператор вправе изменять настоящую Политику без
                    предварительного уведомления пользователей.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Новая редакция вступает в силу с момента её размещения на
                    сайте.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Актуальная версия Политики всегда доступна по адресу:{" "}
                    <a
                      href="https://prorelsa.ru/privacy"
                      className="text-primary hover:underline"
                    >
                      https://prorelsa.ru/privacy
                    </a>
                  </span>
                </li>
              </ul>
            </section>

            <section
              id="final"
              className="rounded-xl border border-border bg-card p-6 md:p-8 mb-6 scroll-mt-24"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  14
                </span>
                Заключительные положения
              </h2>

              <p className="text-muted-foreground mb-4">
                По всем вопросам, связанным с обработкой персональных данных,
                пользователь может обратиться к Оператору:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <a
                  href="mailto:zakaz@prorelsa.ru"
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-colors"
                >
                  <FiMail className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-semibold text-foreground">
                      zakaz@prorelsa.ru
                    </p>
                  </div>
                </a>

                <a
                  href="tel:+78432270005"
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-colors"
                >
                  <FiPhone className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Телефон</p>
                    <p className="text-sm font-semibold text-foreground">
                      +7 (843) 227-00-05
                    </p>
                  </div>
                </a>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                  <FiMapPin className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Почтовый адрес
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      422540, г. Зеленодольск, а/я 34
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-8">
              <Link to="/">
                <Button variant="primary" className="w-full sm:w-auto">
                  Вернуться на главную
                </Button>
              </Link>
              <Link to="/contacts">
                <Button variant="outline" className="w-full sm:w-auto">
                  Контакты
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
