import { TelegramService } from './telegram.service';

describe('TelegramService', () => {
  let service: TelegramService;
  let config: { get: jest.Mock };
  let fetchMock: jest.Mock;

  beforeEach(() => {
    config = { get: jest.fn() };
    service = new TelegramService(config as never);
    fetchMock = jest.fn().mockResolvedValue({ ok: true, text: async () => '' });
    global.fetch = fetchMock as never;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('skips silently when not configured', async () => {
    config.get.mockReturnValue(undefined);

    await service.notify('hi');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts to the Telegram sendMessage endpoint when configured', async () => {
    config.get.mockImplementation((key: string) =>
      key === 'TELEGRAM_BOT_TOKEN' ? 'TOKEN' : 'CHATID',
    );

    await service.notify('hello');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.telegram.org/botTOKEN/sendMessage',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('does not throw when fetch rejects', async () => {
    config.get.mockImplementation((key: string) =>
      key === 'TELEGRAM_BOT_TOKEN' ? 'TOKEN' : 'CHATID',
    );
    fetchMock.mockRejectedValue(new Error('network down'));

    await expect(service.notify('hello')).resolves.toBeUndefined();
  });

  it('does not throw when Telegram responds with an error status', async () => {
    config.get.mockImplementation((key: string) =>
      key === 'TELEGRAM_BOT_TOKEN' ? 'TOKEN' : 'CHATID',
    );
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'Bad Request',
    });

    await expect(service.notify('hello')).resolves.toBeUndefined();
  });

  it('sends to every chat ID in a comma-separated list', async () => {
    config.get.mockImplementation((key: string) =>
      key === 'TELEGRAM_BOT_TOKEN' ? 'TOKEN' : '111, 222,333',
    );

    await service.notify('hello');

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const chatIdsSent = fetchMock.mock.calls.map(
      ([, init]) => JSON.parse(init.body).chat_id,
    );
    expect(chatIdsSent.sort()).toEqual(['111', '222', '333']);
  });

  it('still notifies the other chat IDs if one fails', async () => {
    config.get.mockImplementation((key: string) =>
      key === 'TELEGRAM_BOT_TOKEN' ? 'TOKEN' : '111,222',
    );
    fetchMock.mockImplementation((_url: string, init: { body: string }) => {
      const chatId = JSON.parse(init.body).chat_id;
      return chatId === '111'
        ? Promise.reject(new Error('network down'))
        : Promise.resolve({ ok: true, text: async () => '' });
    });

    await service.notify('hello');

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('treats a blank/whitespace-only chat ID list as unconfigured', async () => {
    config.get.mockImplementation((key: string) =>
      key === 'TELEGRAM_BOT_TOKEN' ? 'TOKEN' : ' , ',
    );

    await service.notify('hi');

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
