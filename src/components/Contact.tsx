import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, Send, Copy, Check } from 'lucide-react';
import { SocialLinks } from '@/components/SocialLinks';
import { useLang } from '@/hooks/use-lang';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const contactSchema = z.object({
  name: z.string().optional().default(''),
  contact: z.string().min(1, 'Contact is required'),
  message: z.string().min(1, 'Message is required'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const contactMethods = [
  {
    icon: Mail,
    label: 'Email',
    value: 'de.max11@mail.ru',
    copyable: true,
  },
  {
    icon: Phone,
    label: 'Phone',
    value: null as string | null,
    copyable: false,
  },
  {
    icon: Send,
    label: 'Telegram',
    value: '@Chistopervii321',
    copyable: true,
  },
];

export default function Contact() {
  const { t } = useLang();
  const { ref, isVisible } = useScrollReveal(0.2);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = async (value: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIdx(idx);
      toast({ title: t('contact.copied'), description: '' });
      setTimeout(
        () => setCopiedIdx((cur) => (cur === idx ? null : cur)),
        1500
      );
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      contact: '',
      message: '',
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('messages').insert({
        name: values.name || null,
        contact: values.contact,
        message: values.message,
      });

      if (error) throw error;

      toast({
        title: t('contact.form.success'),
        description: '',
      });

      form.reset();
    } catch (err) {
      console.error('Error sending message:', err);
      toast({
        title: t('contact.form.error'),
        description: '',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contacts"
      ref={ref}
      className={`reveal py-20 px-4 md:px-8 transition-all duration-700 ${
        isVisible ? 'visible' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-16">
          {t('contact.title')}
        </h2>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Contact Methods */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="space-y-6">
              {contactMethods.map((method, idx) => {
                const Icon = method.icon;
                const isCopied = copiedIdx === idx;
                const value = method.value ?? t('social.dev');
                const inner = (
                  <>
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center group-hover:text-accent transition-colors shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-muted-foreground">
                        {method.label}
                      </p>
                      <p className="text-base text-foreground group-hover:text-accent transition-colors">
                        {value}
                      </p>
                    </div>
                    {method.copyable &&
                      (isCopied ? (
                        <Check className="w-5 h-5 text-accent shrink-0" />
                      ) : (
                        <Copy className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      ))}
                  </>
                );

                return method.copyable ? (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCopy(value, idx)}
                    className="w-full flex items-center gap-4 group cursor-pointer rounded-lg -mx-2 px-2 py-1 hover:bg-secondary/40 transition-colors"
                  >
                    {inner}
                  </button>
                ) : (
                  <div key={idx} className="flex items-center gap-4 group">
                    {inner}
                  </div>
                );
              })}
            </div>

            {/* Social Links */}
            <div>
              <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">
                {t('contact.title')}
              </p>
              <SocialLinks />
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="bg-secondary/50 rounded-lg p-8 border border-border">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        {t('contact.form.name')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your name"
                          autoComplete="name"
                          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Contact Field */}
                <FormField
                  control={form.control}
                  name="contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        {t('contact.form.contact')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Email, Telegram, or Phone"
                          autoComplete="off"
                          className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Message Field */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        {t('contact.form.message')}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your message"
                          autoComplete="off"
                          className="bg-background border-border text-foreground placeholder:text-muted-foreground min-h-32 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting
                    ? `${t('contact.form.submit')}...`
                    : t('contact.form.submit')}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
}
